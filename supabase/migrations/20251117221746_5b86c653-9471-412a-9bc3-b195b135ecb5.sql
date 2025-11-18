-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  global_name TEXT,
  discord_token TEXT,
  avatar_url TEXT,
  account_created_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS na tabela de perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Tabela de estatísticas do usuário
CREATE TABLE public.user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friends_removed INT DEFAULT 0,
  messages_deleted INT DEFAULT 0,
  dms_opened INT DEFAULT 0,
  dms_closed INT DEFAULT 0,
  last_request_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS na tabela de estatísticas
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_statistics
CREATE POLICY "Usuários podem ver suas próprias estatísticas"
  ON public.user_statistics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias estatísticas"
  ON public.user_statistics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias estatísticas"
  ON public.user_statistics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tabela de estatísticas globais
CREATE TABLE public.global_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_messages_deleted BIGINT DEFAULT 0,
  active_users INT DEFAULT 0,
  uptime_percentage DECIMAL(5,2) DEFAULT 99.99,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS - estatísticas globais são públicas
ALTER TABLE public.global_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode ver estatísticas globais"
  ON public.global_statistics FOR SELECT
  TO authenticated, anon
  USING (true);

-- Inserir estatísticas globais iniciais
INSERT INTO public.global_statistics (total_messages_deleted, active_users, uptime_percentage)
VALUES (125847, 3421, 99.97);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para user_statistics
CREATE TRIGGER update_user_statistics_updated_at
  BEFORE UPDATE ON public.user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para criar perfil e estatísticas ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, global_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'global_name', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO public.user_statistics (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();