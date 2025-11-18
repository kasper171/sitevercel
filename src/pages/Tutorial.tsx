import { Card } from "@/components/ui/card";
import { Carousel } from "@/components/Carousel";
import { UserPlus, Download, Settings, Play } from "lucide-react";

export default function Tutorial() {
  const tutorialSlides = [
    <Card key="step1" className="glass h-[500px] p-12">
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
          <UserPlus className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mb-4 text-3xl font-bold">Passo 1: Criar Conta</h2>
        <p className="max-w-md text-lg text-muted-foreground">
          Registre-se com seu email e senha. É rápido e seguro!
        </p>
        <div className="mt-8 rounded-lg bg-card/50 p-4">
          <code className="text-sm text-primary">
            • Acesse a página de registro
            <br />• Preencha seus dados
            <br />• Confirme seu email
          </code>
        </div>
      </div>
    </Card>,
    <Card key="step2" className="glass h-[500px] p-12">
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
          <Download className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mb-4 text-3xl font-bold">Passo 2: Conectar Discord</h2>
        <p className="max-w-md text-lg text-muted-foreground">
          Adicione seu token do Discord para acessar suas mensagens
        </p>
        <div className="mt-8 rounded-lg bg-card/50 p-4">
          <code className="text-sm text-primary">
            • Vá para Configurações
            <br />• Cole seu token do Discord
            <br />• Salve as configurações
          </code>
        </div>
      </div>
    </Card>,
    <Card key="step3" className="glass h-[500px] p-12">
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
          <Settings className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mb-4 text-3xl font-bold">Passo 3: Configurar</h2>
        <p className="max-w-md text-lg text-muted-foreground">
          Personalize suas preferências de limpeza e privacidade
        </p>
        <div className="mt-8 rounded-lg bg-card/50 p-4">
          <code className="text-sm text-primary">
            • Defina filtros de limpeza
            <br />• Escolha servidores/canais
            <br />• Configure automações
          </code>
        </div>
      </div>
    </Card>,
    <Card key="step4" className="glass h-[500px] p-12">
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
          <Play className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mb-4 text-3xl font-bold">Passo 4: Começar a Usar</h2>
        <p className="max-w-md text-lg text-muted-foreground">
          Acesse o Dashboard e comece a gerenciar seu Discord!
        </p>
        <div className="mt-8 rounded-lg bg-card/50 p-4">
          <code className="text-sm text-primary">
            • Veja suas estatísticas
            <br />• Delete mensagens em massa
            <br />• Gerencie amigos e DMs
          </code>
        </div>
      </div>
    </Card>,
  ];

	  return (
	    <div className="min-h-screen px-4 py-16 pb-48">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">Como Usar</h1>
          <p className="text-xl text-muted-foreground">
            Siga estes passos simples para começar a usar nossa plataforma
          </p>
        </div>

        {/* Carousel Tutorial */}
        <div className="mb-16">
          <Carousel items={tutorialSlides} autoPlay={false} />
        </div>

        {/* Tips Section */}
        <Card className="glass p-8">
          <h2 className="mb-6 text-2xl font-bold">Dicas Importantes</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h3 className="mb-2 font-semibold text-primary">⚠️ Segurança</h3>
              <p className="text-sm text-muted-foreground">
                Nunca compartilhe seu token do Discord com ninguém. Mantenha-o seguro em
                suas configurações.
              </p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h3 className="mb-2 font-semibold text-primary">💾 Backup</h3>
              <p className="text-sm text-muted-foreground">
                Faça backup de conversas importantes antes de deletar mensagens. A ação é
                irreversível.
              </p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h3 className="mb-2 font-semibold text-primary">🚀 Performance</h3>
              <p className="text-sm text-muted-foreground">
                Para melhor desempenho, processe até 1.000 mensagens por vez. Processos
                maiores podem demorar mais.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
