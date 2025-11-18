import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { openAllDMs } from "@/lib/DiscordAPI";

// Função auxiliar para simular um pequeno delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface OpenDMsModalProps {
  discordToken: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OpenDMsModal = ({ discordToken, onClose, onSuccess }: OpenDMsModalProps) => {
  const [opening, setOpening] = useState(false);
  const [openedCount, setOpenedCount] = useState(0);

  const handleOpenDMs = async () => {
    setOpening(true);
    setOpenedCount(0);

    try {
      const token = discordToken.trim();
      if (!token) {
        throw new Error("Token do Discord não configurado. Por favor, configure-o nas Configurações.");
      }

      toast.info("Iniciando abertura de DMs com todos os amigos...");

      // A função openAllDMs já lida com a lógica de API e toasts de sucesso/erro
      const count = await openAllDMs(token);
      setOpenedCount(count);

      // Chamar callback de sucesso antes de fechar
      if (onSuccess) {
        await onSuccess();
      }
      
      // Pequeno delay para garantir que o callback foi executado
      await sleep(300);
      onClose(); // Fecha o modal após a conclusão

    } catch (error: any) {
      toast.error(error.message || "Erro ao abrir DMs.");
      console.error(error);
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">
        <MessageSquare className="h-6 w-6 text-red-500" />
        Abrir Todas as DMs
      </h3>
      <p className="text-sm text-muted-foreground">
        Esta ação irá tentar abrir um canal de DM com **todos** os seus amigos.
        <br />
        ⚠️ **Aviso:** O uso de Self-Bots é contra os Termos de Serviço do Discord. Use por sua conta e risco.
      </p>
      <Button
        onClick={handleOpenDMs}
        disabled={opening || !discordToken}
        className="w-full bg-red-600 hover:bg-red-700 text-white"

      >
        {opening ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Abrindo DMs...
          </>
        ) : (
          <>
            <MessageSquare className="mr-2 h-5 w-5" />
            Abrir Todas as DMs
          </>
        )}
      </Button>
      <Button variant="outline" onClick={onClose} className="w-full" disabled={opening}>
        Cancelar
      </Button>
    </div>
  );
};
