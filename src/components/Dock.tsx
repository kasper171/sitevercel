import { Home, BookOpen, LayoutDashboard, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Dock = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const links = [
    { to: "/", icon: Home, label: "Home", public: true },
    { to: "/tutorial", icon: BookOpen, label: "Tutorial", public: true },
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", public: false },
    { to: "/settings", icon: Settings, label: "Configurações", public: false },
  ];

  const visibleLinks = links.filter((link) => link.public || isAuthenticated);

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="glass glass-hover flex items-center gap-2 rounded-2xl px-4 py-3 shadow-lg">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 hover:bg-primary/10"
            activeClassName="bg-primary/20"
          >
            <link.icon className="h-5 w-5 text-muted-foreground transition-all group-hover:scale-110 group-hover:text-primary" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-card px-3 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
              {link.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
