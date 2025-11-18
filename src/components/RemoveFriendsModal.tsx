import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UserX } from "lucide-react";
import { toast } from "sonner";
import { removeAllFriends } from "@/lib/DiscordAPI";

// Função auxiliar para simular um pequeno delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface RemoveFriendsModalProps {
  discordToken: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RemoveFriendsModal = ({ discordToken, onClose, onSuccess }: RemoveFriendsModalProps) => {
  const [removing, setRemoving] = useState(false);
  const [removedCount, setRemovedCount] = useState(0);

  const handleRemoveFriends = async () => {
    setRemoving(true);
    setRemovedCount(0);

    try {
      const token = discordToken.trim();
      if (!token) {
        throw new Error("Token do Discord não configurado. Por favor, configure-o nas Configurações.");
      }

      toast.info("Iniciando remoção de amigos...");

      // A função removeAllFriends já lida com a lógica de API e toasts de sucesso/erro
      const count = await removeAllFriends(token);
      setRemovedCount(count);

      // Chamar callback de sucesso antes de fechar
      if (onSuccess) {
        await onSuccess();
      }
      
      // Pequeno delay para garantir que o callback foi executado
      await sleep(300);
      onClose(); // Fecha o modal após a conclusão

    } catch (error: any) {
      toast.error(error.message || "Erro ao remover amigos.");
      console.error(error);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">
        <UserX className="h-6 w-6" />
        Remover Todos os Amigos
      </h3>
      <p className="text-sm text-muted-foreground">
        Esta ação irá remover **todos** os seus amigos da sua conta conectada.
        <br />
        ⚠️ **Aviso:** O uso de Self-Bots é contra os Termos de Serviço do Discord. Use por sua conta e risco.
      </p>
      <Button
        onClick={handleRemoveFriends}
        disabled={removing || !discordToken}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
        size="lg"
      >
        {removing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Removendo...
          </>
        ) : (
          <>
            <UserX className="mr-2 h-5 w-5" />
            Remover Todos os Amigos
          </>
        )}
      </Button>
      <Button variant="outline" onClick={onClose} className="w-full" disabled={removing}>
        Cancelar
      </Button>
    </div>
  );
};
