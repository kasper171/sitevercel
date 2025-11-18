import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { clearMessagesFromAllDMs } from "@/lib/DiscordAPI";

// Função auxiliar para simular um pequeno delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ClearAllDMsModalProps {
  discordToken: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ClearAllDMsModal = ({ discordToken, onClose, onSuccess }: ClearAllDMsModalProps) => {
  const [clearing, setClearing] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  const handleClearAllDMs = async () => {
    setClearing(true);
    setDeletedCount(0);

    try {
      const token = discordToken.trim();
      if (!token) {
        throw new Error("Token do Discord não configurado. Por favor, configure-o nas Configurações.");
      }

      toast.info("Iniciando limpeza de mensagens em todas as DMs...");

      // A função clearMessagesFromAllDMs já lida com a lógica de API e toasts de sucesso/erro
      const count = await clearMessagesFromAllDMs(token);
      setDeletedCount(count);

      // Chamar callback de sucesso antes de fechar
      if (onSuccess) {
        await onSuccess();
      }
      
      // Pequeno delay para garantir que o callback foi executado
      await sleep(300);
      onClose(); // Fecha o modal após a conclusão

    } catch (error: any) {
      toast.error(error.message || "Erro ao limpar mensagens em todas as DMs.");
      console.error(error);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">
        <Trash2 className="h-6 w-6" />
        Apagar Mensagens de Todas DMs Abertas
      </h3>
      <p className="text-sm text-muted-foreground">
        Esta ação irá apagar **todas as suas mensagens enviadas** em todos os canais de DM abertos.
        <br />
        ⚠️ **Aviso:** O uso de Self-Bots é contra os Termos de Serviço do Discord. Use por sua conta e risco.
      </p>
      <Button
        onClick={handleClearAllDMs}
        disabled={clearing || !discordToken}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
        size="lg"
      >
        {clearing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Limpando DMs...
          </>
        ) : (
          <>
            <Trash2 className="mr-2 h-5 w-5" />
            Apagar Mensagens de Todas DMs
          </>
        )}
      </Button>
      <Button variant="outline" onClick={onClose} className="w-full" disabled={clearing}>
        Cancelar
      </Button>
    </div>
  );
};
