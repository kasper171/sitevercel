import { useEffect, useState } from "react";
import { ArrowRight, Trash2, Users, Activity, Shield, Zap, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Carousel } from "@/components/Carousel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  const [globalStats, setGlobalStats] = useState({
    total_messages_deleted: 0,
    active_users: 0,
    uptime_percentage: 0,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Fetch global statistics
    const fetchStats = async () => {
      const { data } = await supabase
        .from("global_statistics")
        .select("*")
        .single();
      
      if (data) {
        setGlobalStats(data);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: Trash2,
      title: "Limpeza Automática",
      description: "Delete mensagens e DMs em massa com poucos cliques",
    },
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Seus dados são criptografados e protegidos",
    },
    {
      icon: Zap,
      title: "Super Rápido",
      description: "Processa milhares de mensagens em segundos",
    },
    {
      icon: Lock,
      title: "Privacidade Total",
      description: "Não armazenamos suas mensagens do Discord",
    },
  ];

  const carouselItems = [
    <Card key="1" className="glass glass-hover h-[400px] p-8">
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Trash2 className="mb-4 h-16 w-16 text-primary" />
        <h3 className="mb-2 text-2xl font-bold">Limpeza em Massa</h3>
        <p className="text-muted-foreground">
          Delete até 10.000 mensagens de uma vez com nossa ferramenta avançada
        </p>
      </div>
    </Card>,
    <Card key="2" className="glass glass-hover h-[400px] p-8">
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Users className="mb-4 h-16 w-16 text-primary" />
        <h3 className="mb-2 text-2xl font-bold">Gestão de Amigos</h3>
        <p className="text-muted-foreground">
          Remova amigos inativos e organize sua lista automaticamente
        </p>
      </div>
    </Card>,
    <Card key="3" className="glass glass-hover h-[400px] p-8">
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Activity className="mb-4 h-16 w-16 text-primary" />
        <h3 className="mb-2 text-2xl font-bold">Estatísticas Detalhadas</h3>
        <p className="text-muted-foreground">
          Acompanhe todas as suas ações e otimize seu Discord
        </p>
      </div>
    </Card>,
  ];

  const faqs = [
    {
      question: "Como funciona a ferramenta?",
      answer:
        "Conecte sua conta Discord de forma segura, selecione as mensagens ou DMs que deseja limpar e deixe nossa ferramenta fazer o trabalho pesado. Tudo é processado de forma rápida e segura.",
    },
    {
      question: "Meus dados estão seguros?",
      answer:
        "Sim! Utilizamos criptografia de ponta a ponta e não armazenamos suas mensagens. Apenas guardamos estatísticas anônimas para melhorar o serviço.",
    },
    {
      question: "Posso recuperar mensagens deletadas?",
      answer:
        "Não. Uma vez deletadas, as mensagens não podem ser recuperadas. Certifique-se de fazer backup de conversas importantes antes de usar a ferramenta.",
    },
    {
      question: "Existe limite de uso?",
      answer:
        "Usuários gratuitos podem deletar até 1.000 mensagens por dia. Usuários premium têm acesso ilimitado e recursos exclusivos.",
    },
  ];

	  return (
	    <div className="min-h-screen pb-48">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="container relative mx-auto max-w-6xl">
          <div className="animate-fade-up text-center">
            <h1 className="mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-6xl font-black text-transparent md:text-7xl">
              Stealth Tools
              <br />
            </h1>
            <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
              A ferramenta mais poderosa para gerenciar suas mensagens, DMs e amigos
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" className="btn-hero group">
                    Ir para Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg" className="btn-hero group">
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="glass glass-hover p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-primary">
                {globalStats.total_messages_deleted.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Mensagens Deletadas</div>
            </Card>
            <Card className="glass glass-hover p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-primary">
                {globalStats.active_users.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Usuários Ativos</div>
            </Card>
            <Card className="glass glass-hover p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-primary">
                {globalStats.uptime_percentage}%
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-4xl font-bold">Recursos Principais</h2>
          <Carousel items={carouselItems} />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold">Por que nos escolher?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="glass glass-hover group p-6 text-center transition-all duration-300 hover:scale-105"
              >
                <feature.icon className="mx-auto mb-4 h-12 w-12 text-primary transition-transform group-hover:scale-110" />
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-4xl font-bold">Perguntas Frequentes</h2>
          <Card className="glass p-6">
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </section>
    </div>
  );
}
