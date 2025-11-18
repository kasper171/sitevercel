import { Client, RichPresence } from 'discord-rpc';

// Mapeamento para armazenar os clientes RPC ativos por ID de usuário do Discord
const rpcClients = new Map<string, Client>();

// ID da aplicação Discord para o Rich Presence (Usando o ID do exemplo do usuário)
const APPLICATION_ID = "1392674585098457128";

/**
 * Atualiza o Rich Presence com os detalhes da atividade.
 * @param client O cliente RPC.
 * @param activityDetails Os detalhes da atividade (ex: "Apagando Mensagens").
 */
async function updatePresence(client: Client, activityDetails: string) {
    try {
        const presence = new RichPresence()
            .setApplicationId(APPLICATION_ID)
            .setType("PLAYING")
            .setName("meow cl")
            .setDetails(activityDetails)
            // Usando a URL da imagem grande do exemplo do usuário
            .setAssetsLargeImage("https://i.imgur.com/uwwkAnX.png" ) 
            .setAssetsLargeText("meow cl")
            .setStartTimestamp(Date.now())
            .addButton("Join our Discord", "https://discord.gg/meowcl" );

        client.setActivity(presence);
        console.log(`Rich Presence atualizado para ${client.user?.username || 'usuário'}: ${activityDetails}`);
    } catch (error) {
        console.error("Falha ao atualizar o Rich Presence:", error);
    }
}

/**
 * Inicia ou atualiza o Rich Presence para um usuário.
 * @param userId O ID do usuário do Discord.
 * @param userToken O token do usuário (não criptografado).
 * @param activityDetails Os detalhes da atividade (ex: "Apagando Mensagens").
 */
export async function setRichPresence(userId: string, userToken: string, activityDetails: string) {
    if (rpcClients.has(userId)) {
        const client = rpcClients.get(userId)!;
        // Verifica se o cliente está pronto antes de tentar atualizar
        if (client.readyAt) {
            await updatePresence(client, activityDetails);
        }
        return;
    }

    const client = new Client({ transport: 'ipc' }); // Usando 'ipc' como transporte padrão

    client.on("ready", async () => {
        console.log(`Cliente RPC para ${client.user?.username || 'usuário'} está pronto!`);
        rpcClients.set(userId, client);
        await updatePresence(client, activityDetails);
    });

    client.on("error", (error) => {
        console.error(`Erro no cliente RPC para o usuário ${userId}:`, error);
        stopRichPresence(userId);
    });

    client.on("disconnected", () => {
        console.log(`Cliente RPC para o usuário ${userId} foi desconectado.`);
        stopRichPresence(userId);
    });

    try {
        // Usando o token diretamente, conforme instruído pelo usuário.
        // Nota: O discord-rpc padrão usa IPC e não autentica com token de usuário.
        // Esta chamada está sendo mantida para seguir o código de exemplo do usuário.
        await client.login({ clientId: APPLICATION_ID, clientSecret: userToken });
    } catch (error) {
        console.error(`Falha ao fazer login no cliente RPC para o usuário ${userId}. Verifique o token.`, error);
        rpcClients.delete(userId);
    }
}

/**
 * Para o Rich Presence para um usuário.
 * @param userId O ID do usuário do Discord.
 */
export function stopRichPresence(userId: string) {
    const client = rpcClients.get(userId);
    if (client) {
        client.destroy();
        rpcClients.delete(userId);
        console.log(`Cliente RPC para o usuário ${userId}, Finalizou e foi Removido.`);
    }
}
