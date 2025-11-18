import { Github, Instagram, Twitter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  // O usuário fornecerá os links do Imgur para as imagens
    const creators = [
    { 
      name: "rdg", 
      imgUrl: "https://i.imgur.com/jfJYA0j.png", 
      discordLink: "https://discord.com/users/473259862210379777", 
      socialLabel: "@4mgangue",
      badges: [
        { url: "https://i.imgur.com/UdW83mh.png", alt: "Early Supporter" }
      ]
    },
    { 
      name: "nk", 
      imgUrl: "https://i.imgur.com/1vj2sLr.png", 
      discordLink: "https://discord.com/users/737804537997557841", 
      socialLabel: "@bonvivant10",
      badges: [
        { url: "https://i.imgur.com/e21tmDK.png", alt: "Nitro Platina" },
        { url: "https://i.imgur.com/yYZS7yU.png", alt: "Nitro Level 8" }
      ]
    },
    { 
      name: "macan", 
      imgUrl: "https://i.imgur.com/ts6Jtge.png", 
      discordLink: "https://discord.com/users/237746461419241473", 
      socialLabel: "@gastando",
      badges: [
        { url: "https://i.imgur.com/e21tmDK.png", alt: "Nitro Platina" },
        { url: "https://i.imgur.com/UdW83mh.png", alt: "Early Supporter" },
        { url: "https://i.imgur.com/TkcycUD.png", alt: "Pedra Quadrada" }
      ]
	    },
	  ];

  return (
    <footer className="w-full border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Seção Creators */}
        <div className="mb-8 text-center">
          <h2 className="mb-6 text-3xl font-bold text-primary">CREATORS</h2>
          <div className="flex justify-center space-x-12">
            {creators.map((creator) => (
              <div key={creator.name} className="flex flex-col items-center">
	                <a 
	                  href={creator.discordLink} 
	                  target="_blank" 
	                  rel="noopener noreferrer" 
	                  className="group mb-2 block cursor-pointer"
	                >
	                  <Avatar className="h-24 w-24 border-4 border-primary/50 transition-transform duration-300 group-hover:scale-105">
	                    {/* O usuário deve substituir URL_DO_IMGUR_... pelo link real */}
	                    <AvatarImage src={creator.imgUrl} alt={creator.name} />
	                    <AvatarFallback className="bg-primary/20 text-2xl font-bold text-primary">
	                      {creator.name.substring(0, 2)}
	                    </AvatarFallback>
	                  </Avatar>
	                </a>
	                {/* Seção de Insígnias (Badges) */}
	                <div className="flex justify-center space-x-1 mt-1">
	                  {creator.badges && creator.badges.map((badge, index) => (
	                    <img
	                      key={index}
	                      src={badge.url}
	                      alt={badge.alt}
	                      className="h-6 w-6" // 24x24 pixels
	                      title={badge.alt}
	                    />
	                  ))}
	                </div>
	                <span className="text-lg font-semibold text-white">{creator.name}</span>
	                {/* Link para o Discord */}
	                <a 
	                  href={creator.discordLink}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    {creator.socialLabel}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Aviso de Copyright */}
        <div className="mt-8 border-t border-border/50 pt-4 text-center text-sm text-muted-foreground">
          &copy; {currentYear} Stealth.gg - Equipe Sombra Tools. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};
