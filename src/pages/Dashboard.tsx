import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"; // Adicionado para o modal
import { ClearMessagesModal } from "@/components/ClearMessagesModal";
import { RemoveFriendsModal } from "@/components/RemoveFriendsModal";
import { ClearAllDMsModal } from "@/components/ClearAllDMsModal";
import { OpenDMsModal } from "@/components/OpenDMsModal";
import { CloseDMsModal } from "@/components/CloseDMsModal";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, Trash2, Mail, UserMinus, UserX, MessageSquare, XCircle } from "lucide-react";

interface Profile {
  username: string;
  global_name: string | null;
  avatar_url: string | null;
  account_created_at: string;
}

interface Statistics {
  friends_removed: number;
  messages_deleted: number;
  dms_opened: number;
  dms_closed: number;
  last_request_at: string | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [discordToken, setDiscordToken] = useState<string>(""); // Novo estado para o token
  const [isClearMessagesModalOpen, setIsClearMessagesModalOpen] = useState(false);
  const [isRemoveFriendsModalOpen, setIsRemoveFriendsModalOpen] = useState(false);
  const [isClearAllDMsModalOpen, setIsClearAllDMsModalOpen] = useState(false);
  const [isOpenDMsModalOpen, setIsOpenDMsModalOpen] = useState(false);
  const [isCloseDMsModalOpen, setIsCloseDMsModalOpen] = useState(false);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);
      await loadData(session.user.id);
    };

    checkAuth();
  }, [navigate]);

  const loadData = async (uid: string) => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setDiscordToken(profileData.discord_token || ""); // Carrega o token do Discord

      // Load statistics
      const { data: statsData, error: statsError } = await supabase
        .from("user_statistics")
        .select("*")
        .eq("user_id", uid)
        .single();

      if (statsError) throw statsError;
      setStats(statsData);
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Reload data when navigating to this page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userId) {
        loadData(userId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId]);

  const handleRefresh = async () => {
    if (userId) {
      setLoading(true);
      await loadData(userId);
      toast.success("Dados atualizados!");
    }
  };



  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-2xl text-primary">Carregando...</div>
      </div>
    );
  }

	  return (
	    <div className="min-h-screen px-4 py-16 pb-48">
      <div className="container mx-auto max-w-6xl">
        {/* O cabeçalho foi movido para o componente Header.tsx global. */}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* User Card */}
          <Card className="glass glass-hover lg:col-span-1">
            <div className="p-6">
              <div className="mb-6 flex flex-col items-center text-center">
                <Avatar className="mb-4 h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-2xl text-primary">
                    {profile?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mb-1 text-2xl font-bold">{profile?.global_name || profile?.username}</h2>
                <p className="text-sm text-muted-foreground">@{profile?.username}</p>
              </div>

              <div className="space-y-3 border-t border-border/50 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID da Conta</span>
                  <span className="font-mono text-xs">{userId.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Criado em</span>
                  <span>
                    {new Date(profile?.account_created_at || "").toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Statistics Card */}
          <Card className="glass glass-hover lg:col-span-2">
            <div className="p-6">
              <h2 className="mb-6 text-2xl font-bold">Estatísticas</h2>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/20 p-2">
                      <UserMinus className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        {stats?.friends_removed || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Amigos Removidos</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/20 p-2">
                      <Trash2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        {stats?.messages_deleted || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Mensagens Deletadas</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/20 p-2">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        {stats?.dms_opened || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">DMs Abertas</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/20 p-2">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        {stats?.dms_closed || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">DMs Fechadas</div>
                    </div>
                  </div>
                </div>
              </div>

              {stats?.last_request_at && (
                <div className="mt-6 border-t border-border/50 pt-6 text-sm text-muted-foreground">
                  Última solicitação:{" "}
                  {new Date(stats.last_request_at).toLocaleString("pt-BR")}
                </div>
              )}
            </div>
          </Card>
        </div>

		        {/* Quick Actions */}
		        <div className="mt-6">
		          <Card className="glass glass-hover p-6">
		            <h2 className="mb-4 text-xl font-bold">Ações Rápidas</h2>
		            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		              
		              {/* 1. Limpar Mensagens (DM Específica) */}
	              <Dialog open={isClearMessagesModalOpen} onOpenChange={setIsClearMessagesModalOpen}>
	                <DialogTrigger asChild>
	                  <Button 
	                    className="btn-glass"
	                    disabled={!discordToken}
	                  >
	                    <Trash2 className="mr-2 h-4 w-4" />
	                    Limpar DM Específica
	                  </Button>
	                </DialogTrigger>
	                <DialogContent>
	                  <ClearMessagesModal 
	                    discordToken={discordToken} 
	                    onClose={() => setIsClearMessagesModalOpen(false)}
	                    onSuccess={async () => {
	                      await loadData(userId);
	                    }}
	                  />
	                </DialogContent>
	              </Dialog>

		              {/* 2. Remover Amigos */}
	              <Dialog open={isRemoveFriendsModalOpen} onOpenChange={setIsRemoveFriendsModalOpen}>
	                <DialogTrigger asChild>
	                  <Button 
	                    className="btn-glass"
	                    disabled={!discordToken}
	                  >
	                    <UserX className="mr-2 h-4 w-4" />
	                    Remover Amigos
	                  </Button>
	                </DialogTrigger>
	                <DialogContent>
	                  <RemoveFriendsModal 
	                    discordToken={discordToken} 
	                    onClose={() => setIsRemoveFriendsModalOpen(false)}
	                    onSuccess={async () => {
	                      await loadData(userId);
	                    }}
	                  />
	                </DialogContent>
	              </Dialog>

		              {/* 3. Limpar Mensagens (Todas DMs) */}
	              <Dialog open={isClearAllDMsModalOpen} onOpenChange={setIsClearAllDMsModalOpen}>
	                <DialogTrigger asChild>
	                  <Button 
	                    className="btn-glass"
	                    disabled={!discordToken}
	                  >
	                    <Trash2 className="mr-2 h-4 w-4" />
	                    Limpar Todas DMs
	                  </Button>
	                </DialogTrigger>
	                <DialogContent>
	                  <ClearAllDMsModal 
	                    discordToken={discordToken} 
	                    onClose={() => setIsClearAllDMsModalOpen(false)}
	                    onSuccess={async () => {
	                      await loadData(userId);
	                    }}
	                  />
	                </DialogContent>
	              </Dialog>

		              {/* 4. Abrir DMs */}
	              <Dialog open={isOpenDMsModalOpen} onOpenChange={setIsOpenDMsModalOpen}>
	                <DialogTrigger asChild>
	                  <Button 
	                    className="btn-glass"
	                    disabled={!discordToken}
	                  >
	                    <MessageSquare className="mr-2 h-4 w-4" />
	                    Abrir Todas DMs
	                  </Button>
	                </DialogTrigger>
	                <DialogContent>
	                  <OpenDMsModal 
	                    discordToken={discordToken} 
	                    onClose={() => setIsOpenDMsModalOpen(false)}
	                    onSuccess={async () => {
	                      await loadData(userId);
	                    }}
	                  />
	                </DialogContent>
	              </Dialog>

		              {/* 5. Fechar DMs */}
	              <Dialog open={isCloseDMsModalOpen} onOpenChange={setIsCloseDMsModalOpen}>
	                <DialogTrigger asChild>
	                  <Button 
	                    className="btn-glass"
	                    disabled={!discordToken}
	                  >
	                    <XCircle className="mr-2 h-4 w-4" />
	                    Fechar Todas DMs
	                  </Button>
	                </DialogTrigger>
	                <DialogContent>
	                  <CloseDMsModal 
	                    discordToken={discordToken} 
	                    onClose={() => setIsCloseDMsModalOpen(false)}
	                    onSuccess={async () => {
	                      await loadData(userId);
	                    }}
	                  />
	                </DialogContent>
	              </Dialog>
		            </div>
		          </Card>
		        </div>
      </div>
    </div>
  );
}