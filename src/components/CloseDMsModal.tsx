import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { closeAllDMs } from "@/lib/DiscordAPI";

// Função auxiliar para simular um pequeno delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface CloseDMsModalProps {
  discordToken: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CloseDMsModal = ({ discordToken, onClose, onSuccess }: CloseDMsModalProps) => {
  const [closing, setClosing] = useState(false);
  const [closedCount, setClosedCount] = useState(0);

  const handleCloseDMs = async () => {
    setClosing(true);
    setClosedCount(0);

    try {
      const token = discordToken.trim();
      if (!token) {
        throw new Error("Token do Discord não configurado. Por favor, configure-o nas Configurações.");
      }

      toast.info("Iniciando fechamento de todas as DMs abertas...");

      // A função closeAllDMs já lida com a lógica de API e toasts de sucesso/erro
      const count = await closeAllDMs(token);
      setClosedCount(count);

      // Chamar callback de sucesso antes de fechar
      if (onSuccess) {
        await onSuccess();
      }
      
      // Pequeno delay para garantir que o callback foi executado
      await sleep(300);
      onClose(); // Fecha o modal após a conclusão

    } catch (error: any) {
      toast.error(error.message || "Erro ao fechar DMs.");
      console.error(error);
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">
        <XCircle className="h-6 w-6" />
        Fechar Todas as DMs Abertas
      </h3>
      <p className="text-sm text-muted-foreground">
        Esta ação irá tentar fechar (sair) de **todos** os canais de DM abertos.
        <br />
        ⚠️ **Aviso:** O uso de Self-Bots é contra os Termos de Serviço do Discord. Use por sua conta e risco.
      </p>
      <Button
        onClick={handleCloseDMs}
        disabled={closing || !discordToken}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
        size="lg"
      >
        {closing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Fechando DMs...
          </>
        ) : (
          <>
            <XCircle className="mr-2 h-5 w-5" />
            Fechar Todas as DMs
          </>
        )}
      </Button>
      <Button variant="outline" onClick={onClose} className="w-full" disabled={closing}>
        Cancelar
      </Button>
    </div>
  );
};
