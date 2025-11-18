import { createClient } from '../integrations/supabase/client'; // Assumindo que o cliente Supabase é exportado aqui
import { DateTime } from 'luxon';
import { criarEmbedUserInfo } from '../lib/userinfo-logic'; // Vamos criar este arquivo com a lógica adaptada

// O token selfbot deve ser lido da variável de ambiente
const SELFBOT_TOKEN = process.env.SELFBOTTOKEN;
const DISCORD_API_URL = "https://discord.com/api/v9/users";
const CACHE_EXPIRATION_MS = 3600000; // 1 hora

// Função para buscar dados do cache
async function getCache(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('discord_user_cache')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 é "No rows found"
    console.error('Erro ao buscar cache:', error);
    return null;
  }

  if (data) {
    const cachedAt = DateTime.fromISO(data.cached_at);
    const now = DateTime.now();
    const isExpired = now.diff(cachedAt).toMillis() > CACHE_EXPIRATION_MS;

    if (!isExpired) {
      console.log('Dados encontrados no cache e válidos para ID:', userId);
      return data.data; // Retorna o JSONB com os dados do usuário
    } else {
      console.log('Dados no cache para ID:', userId, 'expirados.');
      // Opcional: Deletar o cache expirado para limpeza
      await supabase.from('discord_user_cache').delete().eq('user_id', userId);
    }
  }
  return null;
}

// Função para salvar dados no cache
async function saveCache(userId: string, data: any) {
  const supabase = createClient();
  const { error } = await supabase
    .from('discord_user_cache')
    .upsert({
      user_id: userId,
      data: data,
      cached_at: DateTime.now().toISO(),
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('Erro ao salvar cache:', error);
  } else {
    console.log('Dados salvos no cache para ID:', userId);
  }
}

// Função para buscar dados da API do Discord
async function fetchDiscordData(userId: string) {
  if (!SELFBOT_TOKEN) {
    throw new Error("SELFBOTTOKEN não configurado na variável de ambiente.");
  }

  let res;
  let retryAfter = 0;
  do {
    if (retryAfter > 0) {
      console.log(`Aguardando ${retryAfter} segundos devido ao rate limit...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    }
    
    // A API do Discord é a confirmada pelo usuário
    res = await fetch(`${DISCORD_API_URL}/${userId}/profile?with_mutual_guilds=false`, {
      headers: { "Authorization": SELFBOT_TOKEN }
    });

    if (res.status === 429) {
      const retryAfterHeader = res.headers.get("Retry-After");
      retryAfter = retryAfterHeader ? parseInt(retryAfterHeader) : 1;
      console.warn(`Rate limit atingido. Tentando novamente em ${retryAfter} segundos.`);
    } else {
      retryAfter = 0;
    }
  } while (retryAfter > 0);

  if (!res.ok) {
    throw new Error(`Erro na requisição da API do Discord: ${res.status} ${res.statusText}`);
  }
  
  return await res.json();
}

// Handler principal do novo endpoint
export async function discordUserInfoHandler(req: Request) {
  try {
    // Assumindo que o ID do usuário vem como parâmetro de consulta ou no corpo da requisição
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: "ID do usuário não fornecido." }), { status: 400 });
    }

    // 1. Tentar buscar do cache
    let rawData = await getCache(userId);

    if (!rawData) {
      // 2. Se não estiver no cache ou expirado, buscar da API
      rawData = await fetchDiscordData(userId);
      
      // 3. Salvar no cache
      await saveCache(userId, rawData);
    }

    // 4. Processar os dados brutos usando a lógica do userinfo-module.js
    // A função criarEmbedUserInfo foi adaptada para retornar o objeto userInfo
    const userInfo = criarEmbedUserInfo(rawData, userId);

    // 5. Retornar o objeto userInfo para o frontend
    return new Response(JSON.stringify(userInfo), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Erro no handler do Discord:", error);
    return new Response(JSON.stringify({ error: (error as Error).message || "Erro interno do servidor." }), { status: 500 });
  }
}
