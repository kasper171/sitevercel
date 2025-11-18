import { Router, Request, Response } from 'express';
import { discordUserInfoHandler } from '../../api/discord-user-info';

const router = Router();

// NOVA ROTA: GET /api/discord-user-info?userId=<ID_DO_USUARIO>
// Esta rota usa a lógica de cache Supabase e a API do Discord
router.get('/discord-user-info', async (req: Request, res: Response) => {
  // O handler `discordUserInfoHandler` espera um objeto Request com `url` para extrair o `userId`.
  // Em um ambiente Express, precisamos adaptar a requisição.
  
  // Cria um objeto Request simulado para o handler, extraindo o userId do query
  const userId = req.query.userId as string;
  
  if (!userId) {
    return res.status(400).json({ error: "ID do usuário não fornecido." });
  }

  // Cria um objeto Request simulado para o handler, que espera um objeto com a propriedade `url`
  const simulatedRequest = {
    url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    method: req.method,
    headers: req.headers,
    body: req.body,
  } as Request;

  try {
    // Chama o handler principal
    const response = await discordUserInfoHandler(simulatedRequest);
    
    // O handler retorna um objeto Response. Precisamos extrair o corpo e o status.
    const body = await response.json();
    
    // Retorna a resposta para o cliente
    res.status(response.status).json(body);
  } catch (error) {
    console.error("Erro no endpoint /discord-user-info:", error);
    res.status(500).json({ error: (error as Error).message || "Erro interno do servidor." });
  }
});

export default router;

// INSTRUÇÃO PARA O USUÁRIO:
// Você deve importar este router no seu arquivo principal de servidor (ex: server.ts, index.js)
// e usá-lo com um prefixo, por exemplo:
// app.use('/api', discordRouter);
