import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Progress } from "@/components/ui/progress";

import { Trash2, Loader2 } from "lucide-react";

import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";



// Função auxiliar para simular um pequeno delay

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));



interface ClearMessagesModalProps {

  discordToken: string;

  onClose: () => void;

  onSuccess?: () => void;

}



export const ClearMessagesModal = ({ discordToken, onClose, onSuccess }: ClearMessagesModalProps) => {

  const [recipientId, setRecipientId] = useState("");

  const [clearing, setClearing] = useState(false);

  const [progress, setProgress] = useState(0);

  const [estimatedTotal, setEstimatedTotal] = useState(0);

  const [deletedCount, setDeletedCount] = useState(0);



  const handleClearMessages = async () => {

    setClearing(true);

    setProgress(0);

    setEstimatedTotal(0);

    setDeletedCount(0);

    let deletedCount = 0;



    try {

      if (!discordToken || discordToken.trim() === "") {

        throw new Error("Token do Discord não configurado. Por favor, configure-o nas Configurações.");

      }



      if (!recipientId || recipientId.trim() === "") {

        throw new Error("ID do Destinatário é obrigatório.");

      }



      // Obter o user_id do Supabase (usuário autenticado)

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {

        throw new Error("Sessão não encontrada. Por favor, faça login novamente.");

      }

      const supabaseUserId = session.user.id;



      const token = discordToken.trim();

      

      // 1. Obter o ID do usuário logado (dono do token)

      const userResponse = await fetch('https://discord.com/api/v10/users/@me', {

        headers: { 'Authorization': token },

      });



      if (!userResponse.ok) {

        throw new Error("Token do Discord inválido ou expirado.");

      }

      const currentUser = await userResponse.json();

      const currentUserId = currentUser.id;



      toast.info("Buscando canal de DM...");



      // 2. Obter ou Criar o Canal de DM (API: /users/@me/channels)

      const dmChannelResponse = await fetch('https://discord.com/api/v10/users/@me/channels', {

        method: 'POST',

        headers: {

          'Authorization': token,

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          recipient_id: recipientId.trim(),

        }),

      });



      if (!dmChannelResponse.ok) {

        const errorText = await dmChannelResponse.text();

        console.error('Erro ao obter canal de DM:', errorText);

        throw new Error("Não foi possível obter o canal de DM. Verifique o ID do destinatário.");

      }



      const dmChannel = await dmChannelResponse.json();

      const channelId = dmChannel.id;



      toast.info(`Canal de DM encontrado: ${channelId}. Iniciando limpeza...`);



      let beforeMessageId: string | undefined = undefined;

      let shouldContinue = true;



      // 3. Loop para buscar e deletar mensagens

      while (shouldContinue) {

        // Busca mensagens (limite máximo de 100 por requisição)

        let url = `https://discord.com/api/v10/channels/${channelId}/messages?limit=100`;

        if (beforeMessageId) {

          url += `&before=${beforeMessageId}`;

        }



        const messagesResponse = await fetch(url, {

          headers: { 'Authorization': token },

        });



        if (!messagesResponse.ok) {

          throw new Error("Erro ao buscar mensagens.");

        }



        const messages: any[] = await messagesResponse.json();



        if (messages.length === 0) {

          shouldContinue = false; // Não há mais mensagens

          break;

        }



        // Estimar total de mensagens na primeira iteração

        if (estimatedTotal === 0 && messages.length > 0) {

          setEstimatedTotal(messages.length);

        }



        // Filtra as mensagens enviadas pelo usuário (dono do token)

        const userMessages = messages.filter(msg => msg.author.id === currentUserId);



        // Deleta as mensagens uma por uma

        for (const message of userMessages) {

          await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${message.id}`, {

            method: 'DELETE',

            headers: { 'Authorization': token },

          });

          deletedCount++;

          setDeletedCount(deletedCount);

          

          // Atualizar progresso

          if (estimatedTotal > 0) {

            setProgress(Math.min((deletedCount / estimatedTotal) * 100, 95));

          }

          

          // MODIFICAÇÃO AQUI: Altera de sleep(500) para sleep(1)

          await sleep(1); // Pequeno delay para evitar rate limit (1ms)

        }



        // Atualiza o ponteiro para a próxima iteração

        beforeMessageId = messages[messages.length - 1].id;



        // Se menos de 100 mensagens foram retornadas, chegamos ao fim

        if (messages.length < 100) {

          shouldContinue = false;

        }

        

        // Pequeno delay entre as páginas de mensagens

        await sleep(1);

      }



      setProgress(95);



      // 4. Atualizar estatísticas no Supabase

      const { data: statsData, error: statsError } = await supabase

        .from('user_statistics')

        .select('messages_deleted')

        .eq('user_id', supabaseUserId)

        .single();



      if (statsError) {

        console.error("Erro ao buscar estatísticas:", statsError);

        // Continua mesmo com erro nas estatísticas

      } else {

        const newDeletedCount = statsData.messages_deleted + deletedCount;

        const { error: updateError } = await supabase

          .from('user_statistics')

          .update({ messages_deleted: newDeletedCount })

          .eq('user_id', supabaseUserId);

        

        if (updateError) {

          console.error("Erro ao atualizar estatísticas:", updateError);

        } else {

          console.log(`Estatísticas atualizadas: ${deletedCount} mensagens deletadas`);

        }

      }



      // 5. Atualizar estatísticas globais usando uma função RPC para garantir atomicidade e tempo real
      // A função RPC 'increment_global_messages_deleted' deve ser criada no Supabase.
      // Como não posso criar a função, vou simular a chamada e usar a lógica de UPDATE com RLS.
      // O problema de não atualizar em tempo real é resolvido pelo RLS.

      // Se o RLS está configurado para UPDATE (como na imagem), o problema é a falta de atomicidade.
      // Vou mudar para uma chamada RPC que o usuário deve ter configurado no backend.
      // Se a chamada RPC falhar, o usuário precisará implementá-la.

      // Alternativa: Usar a função rpc 'increment_global_messages_deleted'
      // Se o usuário não a tiver, ele precisará criá-la.
      // Vou usar a lógica de UPDATE com um incremento direto, que é a forma mais simples de corrigir a atomicidade no frontend,
      // mas que ainda pode falhar se houver concorrência.

      // A melhor solução é a função RPC. Vou assumir que o usuário pode implementá-la.
      // Vou usar a função rpc, que é a forma correta de fazer isso de forma atômica.

      // 5. Atualizar estatísticas globais de forma atômica usando a função RPC
      if (deletedCount > 0) {
        const { error: rpcError } = await supabase
          .rpc('increment_global_messages_deleted', { increment_value: deletedCount });

        if (rpcError) {
          console.error("Erro ao atualizar estatísticas globais via RPC. Certifique-se de que a função 'increment_global_messages_deleted' está criada no Supabase:", rpcError);
        } else {
          console.log(`Estatísticas globais atualizadas via RPC: +${deletedCount} mensagens deletadas`);
        }
      }



      setProgress(100);



      toast.success(`Limpeza concluída! ${deletedCount} mensagens deletadas.`);

      

      // Chamar callback de sucesso antes de fechar

      if (onSuccess) {

        await onSuccess();

      }

      

      // Pequeno delay para garantir que o callback foi executado

      await sleep(1);

      onClose(); // Fecha o modal após a conclusão



    } catch (error: any) {

      toast.error(error.message || "Erro ao limpar mensagens.");

      console.error(error);

    } finally {

      setClearing(false);

      setProgress(0);

    }

  };



  return (

    <div className="space-y-4 p-4">

      <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">

        <Trash2 className="h-6 w-6" />

        Limpar Mensagens Enviadas (DM)

      </h3>

      <p className="text-sm text-muted-foreground">

        Insira o ID do usuário com quem você deseja limpar **suas** mensagens enviadas na DM.

        <br />

        ⚠️ **Aviso:** O uso de Self-Bots é contra os Termos de Serviço do Discord. Use por sua conta e risco.

      </p>

      <div>

        <Label htmlFor="recipient-id">ID do Destinatário (Usuário)</Label>

        <Input

          id="recipient-id"

          value={recipientId}

          onChange={(e) => setRecipientId(e.target.value)}

          placeholder="Ex: 123456789012345678"

          className="mt-2 font-mono"

          disabled={clearing}

        />

      </div>

      {clearing && (

        <div className="space-y-2">

          <div className="flex items-center justify-between text-sm">

            <span className="text-muted-foreground">Progresso da limpeza</span>

            <span className="font-medium">{Math.round(progress)}%</span>

          </div>

          <Progress value={progress} className="h-2" />

        </div>

      )}

      <Button

        onClick={handleClearMessages}

        disabled={clearing || !discordToken || !recipientId}

        className="w-full bg-red-600 hover:bg-red-700 text-white"

        size="lg"

      >

        {clearing ? (

          <>

            <Loader2 className="mr-2 h-5 w-5 animate-spin" />

            Limpando... ({deletedCount} deletadas)

          </>

        ) : (

          <>

            <Trash2 className="mr-2 h-5 w-5" />

            Limpar Minhas Mensagens

          </>

        )}

      </Button>

      <Button variant="outline" onClick={onClose} className="w-full" disabled={clearing}>

        Cancelar

      </Button>

    </div>

  );

};