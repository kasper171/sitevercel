import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Shield, Key } from "lucide-react";

// Função auxiliar para calcular a data de criação da conta Discord a partir do ID (Snowflake)
const getDiscordAccountCreatedAt = (discordId: string): string => {
  const discordEpoch = 1420070400000;
  // O BigInt é necessário para lidar com números grandes do Snowflake ID
  const createdTimestamp = Number(BigInt(discordId) >> 22n) + discordEpoch;
  return new Date(createdTimestamp).toISOString();
};

// Função auxiliar para construir a URL do avatar
const getDiscordAvatarUrl = (userId: string, avatarHash: string | null): string | null => {
  if (!avatarHash) return null;
  const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}?size=256`;
};

interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
}

export default function Settings( ) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [discordToken, setDiscordToken] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      // Load current profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setUsername(profileData.username || "");
        setDiscordToken(profileData.discord_token || "");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      let updateData: {
        username: string;
        discord_token: string;
        global_name?: string;
        avatar_url?: string | null;
        account_created_at?: string;
      } = {
        username,
        discord_token: discordToken.trim(),
      };

      // Se o token do Discord for fornecido, busca os dados do perfil diretamente
      if (discordToken && discordToken.trim() !== "") {
        toast.info("Buscando dados do Discord...");

        // **CORREÇÃO APLICADA AQUI:** Chamada direta à API do Discord, sem a função Edge.
        // O token de usuário (Self-Bot) é enviado diretamente no cabeçalho Authorization.
        const discordResponse = await fetch('https://discord.com/api/v10/users/@me', {
          headers: {
            'Authorization': discordToken.trim( ),
          },
        });

        if (!discordResponse.ok) {
          const errorText = await discordResponse.text();
          console.error('Erro da API do Discord:', errorText);
          // Mensagem de erro mais clara para o usuário
          throw new Error('Token inválido ou expirado. Verifique seu token do Discord.');
        }

        const discordUser: DiscordUser = await discordResponse.json();
        
        // Processa os dados do Discord
        const accountCreatedAt = getDiscordAccountCreatedAt(discordUser.id);
        const avatarUrl = getDiscordAvatarUrl(discordUser.id, discordUser.avatar);

        // Adiciona os dados do Discord para atualização
        updateData.username = discordUser.username;
        updateData.global_name = discordUser.global_name || discordUser.username;
        updateData.avatar_url = avatarUrl;
        updateData.account_created_at = accountCreatedAt;

        toast.success("Dados do Discord obtidos com sucesso!");
      }

      // Atualiza o perfil no Supabase
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Configurações salvas com sucesso!");

    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar configurações");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-16 pb-24">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Configurações</h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie suas preferências e conexões
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="glass glass-hover p-6">
            <div className="mb-6 flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Perfil</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu nome de usuário"
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Discord Integration */}
          <Card className="glass glass-hover p-6">
            <div className="mb-6 flex items-center gap-3">
              <Key className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Integração Discord</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="discord-token">Token do Discord</Label>
                <Input
                  id="discord-token"
                  type="password"
                  value={discordToken}
                  onChange={(e) => setDiscordToken(e.target.value)}
                  placeholder="Cole seu token aqui"
                  className="mt-2 font-mono"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  ⚠️ Mantenha seu token seguro. Nunca o compartilhe com ninguém.
                </p>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <h3 className="mb-2 font-semibold text-primary">✨ Sincronização Automática</h3>
                <p className="text-sm text-muted-foreground">
                  Quando você salvar seu token, buscaremos automaticamente do Discord:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Foto de perfil</li>
                  <li>• Nome de usuário</li>
                  <li>• Nome global</li>
                  <li>• ID da conta</li>
                  <li>• Data de criação da conta</li>
                </ul>
              </div>

              <div className="rounded-lg border border-muted bg-card p-4">
                <h3 className="mb-2 font-semibold">Como obter seu token?</h3>
                <ol className="space-y-1 text-sm text-muted-foreground">
                  <li>1. Abra o Discord no navegador (não no app)</li>
                  <li>2. Pressione F12 para abrir DevTools</li>
                  <li>3. Vá na aba "Console"</li>
                  <li>4. Cole o comando para extrair o token e pressione Enter</li>
                  <li>5. Copie o token exibido (sem as aspas)</li>
                  <li>6. Cole acima e clique em "Salvar"</li>
                </ol>
                <p className="mt-3 text-xs text-muted-foreground">
                  💡 Dica: O token começa com letras e números, algo como "NDczMjU5ODYy..."
                </p>
              </div>
            </div>
          </Card>

          {/* Security Notice */}
          <Card className="glass border-primary/30 bg-primary/5 p-6">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-primary">
              <Shield className="h-5 w-5" />
              Aviso de Segurança
            </h3>
            <p className="text-sm text-muted-foreground">
              Seu token é armazenado de forma criptografada e segura. Ele é usado apenas
              para acessar suas mensagens e DMs do Discord através da API oficial. Nunca
              compartilhamos seus dados com terceiros.
            </p>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="btn-hero"
              size="lg"
            >
              <Save className="mr-2 h-5 w-5" />
              {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
