import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { getDiscordUserInfo } from '@/lib/DiscordAPI';
import { Loader2, Search, User } from 'lucide-react';
import { toast } from 'sonner';

// Definição de tipo para o objeto de informação do usuário
interface UserInfo {
  profilePicture?: string;
  username: string;
  globalName: string;
  id: string;
  badgesText: string;
  accountCreationDate: string;
  signedNitroSince: string;
  nextNitroUpgrade: string;
  currentNitroBadge: string;
  nextNitroBadge: string;
  boosterSince: string;
  nextBoosterUpgrade: string;
  currentBoosterBadge: string;
  nextBoosterBadge: string;
  rawData: any;
}

const DiscordUserInfoCard: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!userId.trim()) {
      toast.error('Por favor, insira um ID de usuário do Discord.');
      return;
    }

    setIsLoading(true);
    setUserInfo(null);

    try {
      const data: UserInfo = await getDiscordUserInfo(userId.trim());
      setUserInfo(data);
      toast.success('Informações do usuário obtidas com sucesso!');
    } catch (error) {
      console.error('Erro ao buscar informações do Discord:', error);
      toast.error((error as Error).message || 'Erro ao buscar informações do usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="col-span-full md:col-span-4 lg:col-span-6 xl:col-span-8 border-4 border-yellow-500 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <User className="w-6 h-6 mr-2 text-yellow-500" />
          Discord User Info (NOVA FEATURE)
        </CardTitle>
        <CardDescription>
          Busque informações detalhadas de um usuário do Discord, incluindo datas de criação e upgrades de Nitro/Booster.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-6">
          <Input
            placeholder="Insira o ID do Usuário do Discord"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isLoading}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Buscar
          </Button>
        </div>

        {userInfo && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-4">
              {userInfo.profilePicture ? (
                <img
                  src={userInfo.profilePicture}
                  alt="Avatar do Usuário"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <div>
                <p className="text-xl font-bold">{userInfo.globalName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{userInfo.username}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">ID: {userInfo.id}</p>
              </div>
            </div>

            <div className="text-sm">
              <p className="font-semibold mb-2">Insígnias:</p>
              <div className="text-lg">{userInfo.badgesText || 'Nenhuma insígnia especial.'}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                <p className="font-semibold text-yellow-500">Conta Criada em:</p>
                <p>{userInfo.accountCreationDate}</p>
              </div>

              {/* Informações de Nitro */}
              {userInfo.signedNitroSince !== 'N/A' && (
                <>
                  <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                    <p className="font-semibold text-yellow-500">Assinante Nitro Desde:</p>
                    <p>{userInfo.signedNitroSince}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                    <p className="font-semibold text-yellow-500">Nível Nitro Atual:</p>
                    <p className="flex items-center">{userInfo.currentNitroBadge} {userInfo.currentNitroBadge.split(':')[0].replace('<', '')}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                    <p className="font-semibold text-yellow-500">Próximo Upgrade Nitro:</p>
                    <p className="flex items-center">{userInfo.nextNitroBadge} {userInfo.nextNitroUpgrade}</p>
                  </div>
                </>
              )}

              {/* Informações de Booster */}
              {userInfo.boosterSince !== 'N/A' && (
                <>
                  <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                    <p className="font-semibold text-yellow-500">Booster Desde:</p>
                    <p>{userInfo.boosterSince}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                    <p className="font-semibold text-yellow-500">Nível Booster Atual:</p>
                    <p className="flex items-center">{userInfo.currentBoosterBadge} {userInfo.currentBoosterBadge.split(':')[0].replace('<', '')}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                    <p className="font-semibold text-yellow-500">Próximo Upgrade Booster:</p>
                    <p className="flex items-center">{userInfo.nextBoosterBadge} {userInfo.nextBoosterUpgrade}</p>
                  </div>
                </>
              )}
            </div>
            
            {/* Dados Adicionais (rawData) */}
            <div className="pt-4 border-t mt-4">
                <p className="font-semibold text-yellow-500 mb-2">Dados Adicionais (API Raw Data):</p>
                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded-md overflow-auto max-h-40">
                    {JSON.stringify(userInfo.rawData, null, 2)}
                </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscordUserInfoCard;
