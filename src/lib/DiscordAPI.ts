import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Função auxiliar para simular um pequeno delay (para evitar rate limit do Discord)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// URL base da API do Discord
const DISCORD_API_BASE = 'https://discord.com/api/v10';

/**
 * Obtém o ID do usuário logado (dono do token).
 * @param token O token de autorização do Discord.
 * @returns O ID do usuário.
 */
export async function getCurrentUserId(token: string): Promise<string> {
    const userResponse = await fetch(`${DISCORD_API_BASE}/users/@me`, {
        headers: { 'Authorization': token },
    });

    if (!userResponse.ok) {
        throw new Error("Token do Discord inválido ou expirado.");
    }
    const currentUser = await userResponse.json();
    return currentUser.id;
}

/**
 * Atualiza as estatísticas do usuário e globais no Supabase.
 * @param supabaseUserId O ID do usuário no Supabase.
 * @param column A coluna da estatística a ser atualizada (ex: 'messages_deleted').
 * @param count O número a ser adicionado à estatística.
 */
async function updateStatistics(supabaseUserId: string, column: string, count: number) {
    if (count === 0) return;

    // 1. Atualizar estatísticas do usuário
    const { data: statsData, error: statsError } = await supabase
        .from('user_statistics')
        .select('*') // Seleciona todas as colunas para garantir que a linha existe
        .eq('user_id', supabaseUserId)
        .single();

    if (statsError && statsError.code !== 'PGRST116') { // PGRST116 = No rows found
        console.error(`Erro ao buscar estatísticas do usuário para ${column}:`, statsError);
    } else {
        const currentCount = statsData ? (statsData as any)[column] || 0 : 0;
        const newCount = currentCount + count;
        
        const updatePayload = {
            [column]: newCount,
            last_request_at: new Date().toISOString()
        };

        // Se a linha não existe, insere uma nova. Caso contrário, atualiza.
        if (statsError && statsError.code === 'PGRST116') {
            const insertPayload = {
                user_id: supabaseUserId,
                friends_removed: 0,
                messages_deleted: 0,
                dms_opened: 0,
                dms_closed: 0,
                ...updatePayload
            };
            const { error: insertError } = await supabase
                .from('user_statistics')
                .insert([insertPayload]);

            if (insertError) {
                console.error(`Erro ao inserir estatísticas do usuário para ${column}:`, insertError);
            } else {
                console.log(`Estatísticas do usuário inseridas e atualizadas: +${count} em ${column}`);
            }
        } else {
            const { error: updateError } = await supabase
                .from('user_statistics')
                .update(updatePayload)
                .eq('user_id', supabaseUserId);
            
            if (updateError) {
                console.error(`Erro ao atualizar estatísticas do usuário para ${column}:`, updateError);
            } else {
                console.log(`Estatísticas do usuário atualizadas: +${count} em ${column}`);
            }
        }
    }

    // 2. Atualizar estatísticas globais (apenas para mensagens deletadas)
    if (column === 'messages_deleted') {
        // Para garantir a atomicidade e evitar race conditions, vamos usar a sintaxe de incremento
        // diretamente no UPDATE, que é suportada pelo PostgREST/Supabase.
        
        // Primeiro, tentamos obter o ID da única linha de estatísticas globais.
        // Usaremos o ID fixo da sua imagem para garantir que a linha correta seja atualizada.
        const GLOBAL_STATS_ID = '88576229-ccb4-43a5-b24e-fd9a6d0a443';

        const { error: globalUpdateError } = await supabase
            .from('global_statistics')
            .update({ 
                total_messages_deleted: supabase.raw('total_messages_deleted + ?', [count]),
                updated_at: new Date().toISOString()
            })
            .eq('id', GLOBAL_STATS_ID);

        if (globalUpdateError) {
            console.error("Erro ao atualizar estatísticas globais:", globalUpdateError);
        } else {
            console.log(`Estatísticas globais atualizadas: +${count} mensagens deletadas`);
        }
    }
}

/**
 * Obtém o ID do usuário Supabase autenticado.
 * @returns O ID do usuário Supabase.
 */
async function getSupabaseUserId(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("Sessão não encontrada. Por favor, faça login novamente.");
    }
    return session.user.id;
}

// ====================================================================
// 1. REMOVER AMIGOS (REMOVE TODOS AMIGOS DA CONTA TOKEN CONECTADA)
// ====================================================================

/**
 * Remove todos os amigos da conta conectada.
 * @param token O token de autorização do Discord.
 */
export async function removeAllFriends(token: string): Promise<number> {
    const supabaseUserId = await getSupabaseUserId();
    const trimmedToken = token.trim();
    if (!trimmedToken) {
        throw new Error("Token do Discord não configurado.");
    }

    toast.info("Buscando lista de amigos...");

    // 1. Obter a lista de relacionamentos (amigos)
    const friendsResponse = await fetch(`${DISCORD_API_BASE}/users/@me/relationships`, {
        headers: { 'Authorization': trimmedToken },
    });

    if (!friendsResponse.ok) {
        throw new Error("Erro ao buscar a lista de amigos. Verifique o token.");
    }

    const relationships: any[] = await friendsResponse.json();
    // Tipo 1: Amigo (Friend)
    const friends = relationships.filter(rel => rel.type === 1);

    if (friends.length === 0) {
        toast.success("Nenhum amigo encontrado para remover.");
        return 0;
    }

    toast.info(`Encontrados ${friends.length} amigos. Iniciando remoção...`);

    let removedCount = 0;
    for (const friend of friends) {
        const friendId = friend.id;
        const friendUsername = friend.user?.username || `ID: ${friendId}`;

        // 2. Remover o amigo (DELETE /users/@me/relationships/{user_id})
        const removeResponse = await fetch(`${DISCORD_API_BASE}/users/@me/relationships/${friendId}`, {
            method: 'DELETE',
            headers: { 'Authorization': trimmedToken },
        });

        if (removeResponse.ok) {
            removedCount++;
            console.log(`Amigo removido: ${friendUsername}`);
        } else {
            console.error(`Erro ao remover amigo ${friendUsername}:`, await removeResponse.text());
        }

        await sleep(100); // Delay para evitar rate limit
    }

    // Atualiza as estatísticas no Supabase
    if (removedCount > 0) {
        await updateStatistics(supabaseUserId, 'friends_removed', removedCount);
    }

    toast.success(`Remoção de amigos concluída! ${removedCount} amigos removidos.`);
    return removedCount;
}

// ====================================================================
// 2. APAGAR MENSAGENS DE TODAS DMS ABERTAS
// ====================================================================

/**
 * Apaga todas as mensagens enviadas pelo usuário em um canal de DM específico.
 * @param token O token de autorização do Discord.
 * @param channelId O ID do canal de DM.
 * @param currentUserId O ID do usuário logado.
 * @param supabaseUserId O ID do usuário no Supabase para atualização de estatísticas.
 * @returns O número de mensagens deletadas.
 */
async function clearMessagesInChannel(token: string, channelId: string, currentUserId: string, supabaseUserId: string): Promise<number> {
    let deletedCount = 0;
    let beforeMessageId: string | undefined = undefined;
    let shouldContinue = true;

    while (shouldContinue) {
        // Busca mensagens (limite máximo de 100 por requisição)
        let url = `${DISCORD_API_BASE}/channels/${channelId}/messages?limit=100`;
        if (beforeMessageId) {
            url += `&before=${beforeMessageId}`;
        }

        const messagesResponse = await fetch(url, {
            headers: { 'Authorization': token },
        });

        if (!messagesResponse.ok) {
            console.error(`Erro ao buscar mensagens no canal ${channelId}:`, await messagesResponse.text());
            break; // Sai do loop se houver erro
        }

        const messages: any[] = await messagesResponse.json();

        if (messages.length === 0) {
            shouldContinue = false; // Não há mais mensagens
            break;
        }

        // Filtra as mensagens enviadas pelo usuário (dono do token)
        const userMessages = messages.filter(msg => msg.author.id === currentUserId);

        // Deleta as mensagens uma por uma
        for (const message of userMessages) {
            const deleteResponse = await fetch(`${DISCORD_API_BASE}/channels/${channelId}/messages/${message.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': token },
            });

            if (deleteResponse.ok) {
                deletedCount++;
            } else {
                console.error(`Erro ao deletar mensagem ${message.id}:`, await deleteResponse.text());
            }
            
            await sleep(100); // Pequeno delay para evitar rate limit (500ms)
        }

        // Atualiza o ponteiro para a próxima iteração
        beforeMessageId = messages[messages.length - 1].id;

        // Se menos de 100 mensagens foram retornadas, chegamos ao fim
        if (messages.length < 100) {
            shouldContinue = false;
        }
        
        // Pequeno delay entre as páginas de mensagens
        await sleep(100);
    }

    // Atualiza as estatísticas no Supabase
    if (deletedCount > 0) {
        await updateStatistics(supabaseUserId, 'messages_deleted', deletedCount);
    }

    return deletedCount;
}

/**
 * Apaga mensagens de todas as DMs abertas.
 * @param token O token de autorização do Discord.
 */
export async function clearMessagesFromAllDMs(token: string): Promise<number> {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
        throw new Error("Token do Discord não configurado.");
    }

    const supabaseUserId = await getSupabaseUserId();
    const currentUserId = await getCurrentUserId(trimmedToken);

    toast.info("Buscando lista de canais de DM abertos...");

    // 1. Obter a lista de canais de DM (GET /users/@me/channels)
    const channelsResponse = await fetch(`${DISCORD_API_BASE}/users/@me/channels`, {
        headers: { 'Authorization': trimmedToken },
    });

    if (!channelsResponse.ok) {
        throw new Error("Erro ao buscar canais de DM. Verifique o token.");
    }

    const channels: any[] = await channelsResponse.json();
    // Filtra apenas canais de DM (tipo 1)
    const dmChannels = channels.filter(channel => channel.type === 1);

    if (dmChannels.length === 0) {
        toast.success("Nenhum canal de DM aberto encontrado.");
        return 0;
    }

    toast.info(`Encontrados ${dmChannels.length} canais de DM. Iniciando limpeza...`);

    let totalDeletedCount = 0;
    for (const channel of dmChannels) {
        const recipient = channel.recipients?.[0]?.username || `ID: ${channel.id}`;
        toast.info(`Limpando mensagens na DM com ${recipient}...`);
        
        const deletedCount = await clearMessagesInChannel(trimmedToken, channel.id, currentUserId, supabaseUserId);
        totalDeletedCount += deletedCount;

        toast.info(`DM com ${recipient} limpa. ${deletedCount} mensagens deletadas.`);
    }

    toast.success(`Limpeza de todas as DMs concluída! Total de ${totalDeletedCount} mensagens deletadas.`);
    return totalDeletedCount;
}

// ====================================================================
// 3. ABRIR DMS (ABRE TODAS DMS COM OS AMIGOS ADICIONADOS)
// ====================================================================

/**
 * Abre canais de DM com todos os amigos adicionados.
 * @param token O token de autorização do Discord.
 */
export async function openAllDMs(token: string): Promise<number> {
    const supabaseUserId = await getSupabaseUserId();
    const trimmedToken = token.trim();
    if (!trimmedToken) {
        throw new Error("Token do Discord não configurado.");
    }

    toast.info("Buscando lista de amigos para abrir DMs...");

    // 1. Obter a lista de relacionamentos (amigos)
    const friendsResponse = await fetch(`${DISCORD_API_BASE}/users/@me/relationships`, {
        headers: { 'Authorization': trimmedToken },
    });

    if (!friendsResponse.ok) {
        throw new Error("Erro ao buscar a lista de amigos. Verifique o token.");
    }

    const relationships: any[] = await friendsResponse.json();
    // Tipo 1: Amigo (Friend)
    const friends = relationships.filter(rel => rel.type === 1);

    if (friends.length === 0) {
        toast.success("Nenhum amigo encontrado para abrir DMs.");
        return 0;
    }

    toast.info(`Encontrados ${friends.length} amigos. Iniciando abertura de DMs...`);

    let openedCount = 0;
    for (const friend of friends) {
        const friendId = friend.id;
        const friendUsername = friend.user?.username || `ID: ${friendId}`;

        // 2. Abrir o canal de DM (POST /users/@me/channels)
        const dmChannelResponse = await fetch(`${DISCORD_API_BASE}/users/@me/channels`, {
            method: 'POST',
            headers: {
                'Authorization': trimmedToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipient_id: friendId,
            }),
        });

        if (dmChannelResponse.ok) {
            openedCount++;
            console.log(`DM aberta com: ${friendUsername}`);
        } else {
            console.error(`Erro ao abrir DM com ${friendUsername}:`, await dmChannelResponse.text());
        }

        await sleep(100); // Delay para evitar rate limit
    }

    // Atualiza as estatísticas no Supabase
    if (openedCount > 0) {
        await updateStatistics(supabaseUserId, 'dms_opened', openedCount);
    }

    toast.success(`Abertura de DMs concluída! ${openedCount} DMs abertas.`);
    return openedCount;
}

// ====================================================================
// 4. FECHAR DMS (FECHA TODAS DMS QUE ESTAO ABERTAS)
// ====================================================================

/**
 * Fecha (sai) de todos os canais de DM abertos.
 * @param token O token de autorização do Discord.
 */
export async function closeAllDMs(token: string): Promise<number> {
    const supabaseUserId = await getSupabaseUserId();
    const trimmedToken = token.trim();
    if (!trimmedToken) {
        throw new Error("Token do Discord não configurado.");
    }

    toast.info("Buscando lista de canais de DM abertos para fechar...");

    // 1. Obter a lista de canais de DM (GET /users/@me/channels)
    const channelsResponse = await fetch(`${DISCORD_API_BASE}/users/@me/channels`, {
        headers: { 'Authorization': trimmedToken },
    });

    if (!channelsResponse.ok) {
        throw new Error("Erro ao buscar canais de DM. Verifique o token.");
    }

    const channels: any[] = await channelsResponse.json();
    // Filtra apenas canais de DM (tipo 1)
    const dmChannels = channels.filter(channel => channel.type === 1);

    if (dmChannels.length === 0) {
        toast.success("Nenhum canal de DM aberto encontrado para fechar.");
        return 0;
    }

    toast.info(`Encontrados ${dmChannels.length} canais de DM. Iniciando fechamento...`);

    let closedCount = 0;
    for (const channel of dmChannels) {
        const channelId = channel.id;
        const recipient = channel.recipients?.[0]?.username || `ID: ${channelId}`;

        // 2. Fechar o canal de DM (DELETE /channels/{channel_id})
        // Nota: Para DMs, a API do Discord trata o DELETE como "sair" do canal, o que o fecha.
        const closeResponse = await fetch(`${DISCORD_API_BASE}/channels/${channelId}`, {
            method: 'DELETE',
            headers: { 'Authorization': trimmedToken },
        });

        if (closeResponse.ok) {
            closedCount++;
            console.log(`DM fechada com: ${recipient}`);
        } else {
            console.error(`Erro ao fechar DM com ${recipient}:`, await closeResponse.text());
        }

        await sleep(100); // Delay para evitar rate limit
    }

    // Atualiza as estatísticas no Supabase
    if (closedCount > 0) {
        await updateStatistics(supabaseUserId, 'dms_closed', closedCount);
    }

    toast.success(`Fechamento de DMs concluído! ${closedCount} DMs fechadas.`);
    return closedCount;
}
