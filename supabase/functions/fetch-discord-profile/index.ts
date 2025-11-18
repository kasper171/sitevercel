import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  discriminator: string;
  created_timestamp: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { discordToken } = await req.json();

    if (!discordToken || discordToken.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Token do Discord é obrigatório' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Buscando dados do Discord...');

    // Fetch user data from Discord API
    const discordResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bearer ${discordToken.trim()}`,
      },
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('Erro da API do Discord:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Token inválido ou expirado. Verifique seu token do Discord.',
          details: errorText 
        }),
        { 
          status: discordResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const discordUser: DiscordUser = await discordResponse.json();
    console.log('Dados do Discord recebidos:', discordUser.username);

    // Calculate account creation date from Discord ID (Snowflake)
    const discordEpoch = 1420070400000;
    const createdTimestamp = Number(BigInt(discordUser.id) >> 22n) + discordEpoch;
    const accountCreatedAt = new Date(createdTimestamp).toISOString();

    // Build avatar URL
    let avatarUrl = null;
    if (discordUser.avatar) {
      const extension = discordUser.avatar.startsWith('a_') ? 'gif' : 'png';
      avatarUrl = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${extension}?size=256`;
    }

    // Update user profile in Supabase
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Erro ao obter usuário:', userError);
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update profile with Discord data
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        username: discordUser.username,
        global_name: discordUser.global_name || discordUser.username,
        avatar_url: avatarUrl,
        account_created_at: accountCreatedAt,
        discord_token: discordToken.trim(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar perfil', details: updateError }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Perfil atualizado com sucesso!');

    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          id: discordUser.id,
          username: discordUser.username,
          global_name: discordUser.global_name || discordUser.username,
          avatar_url: avatarUrl,
          account_created_at: accountCreatedAt,
        },
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
