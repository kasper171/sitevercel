import { DateTime } from 'luxon';

// Mapeamento de insígnias e emojis (adaptado do userinfo-module.js)
const badgeEmojis: { [key: string]: string } = {
  'staff': '<:0ds:1415359246505083019>',
  'partner': '<:2pso:1415359253522153503>',
  'hypesquad_house_1': '<:Hypesquad_bravery_badge:1415382267194507374>',
  'hypesquad_house_2': '<:Hypesquad_brilliance_badge:1415382268926759014>',
  'hypesquad_house_3': '<:Hypesquad_balance_badge:1415382265340629122>',
  'bug_hunter_level_1': '<:1bh_a:1415359249525248050>',
  'bug_hunter_level_2': '<:1bh_b:1415359252096225411>',
  'early_supporter': '<:5es:1415390202888978462>',
  'verified_developer': '<:6bd:1415391336084803594>',
  'active_developer': '<:7ad:1415359236065722438>',
  'legacy_username': '<:Legacy_Username_Badge:1415391587818537051>',
  'quest_completed': '<:Quest_Badge:1415382398522101800>',
  'premium_tenure_1_month_v2': '<:Nitro_Badge_Bronze:1415382270998483015>',
  'premium_tenure_3_month_v2': '<:Nitro_Badge_Silver:1415382284890148986>',
  'premium_tenure_6_month_v2': '<:Nitro_Badge_Gold:1415382277004857524>',
  'premium_tenure_12_month_v2': '<:Nitro_Badge_Platinum:1415382281111077075>',
  'premium_tenure_24_month_v2': '<:Nitro_Badge_Diamond:1415382273083183144>',
  'premium_tenure_36_month_v2': '<:Nitro_Badge_Emerald:1415382275109028003>',
  'premium_tenure_60_month_v2': '<:Nitro_Badge_Ruby:1415382273083183144>',
  'premium_tenure_72_month_v2': '<:Nitro_Badge_Opal:1415382279257194517>',
  'guild_booster_lvl1': '<:00x:1415359230617194692>',
  'guild_booster_lvl2': '<:00w:1415359229249982636>',
  'guild_booster_lvl3': '<:00v:1415359227601490042>',
  'guild_booster_lvl4': '<:00u:1415359225802129438>',
  'guild_booster_lvl5': '<:00t:1415359223155396683>',
  'guild_booster_lvl6': '<:00s:1415359221620408480>',
  'guild_booster_lvl7': '<:00r:1415359219733106783>',
  'guild_booster_lvl8': '<:00q:1415359217983950990>',
  'guild_booster_lvl9': '<:00p:1415359216096645212>',
};

// Mapeamento dos níveis e meses de duração (adaptado do userinfo-module.js)
const nitroDurations: { [key: string]: number } = {
  'premium_tenure_1_month_v2': 1,
  'premium_tenure_3_month_v2': 3,
  'premium_tenure_6_month_v2': 6,
  'premium_tenure_12_month_v2': 12,
  'premium_tenure_24_month_v2': 24,
  'premium_tenure_36_month_v2': 36,
  'premium_tenure_60_month_v2': 60,
  'premium_tenure_72_month_v2': 72,
};

// Mapeamento dos próximos níveis de Nitro (adaptado do userinfo-module.js)
const nextNitroLevel: { [key: string]: string } = {
  'premium_tenure_1_month_v2': 'premium_tenure_3_month_v2',
  'premium_tenure_3_month_v2': 'premium_tenure_6_month_v2',
  'premium_tenure_6_month_v2': 'premium_tenure_12_month_v2',
  'premium_tenure_12_month_v2': 'premium_tenure_24_month_v2',
  'premium_tenure_24_month_v2': 'premium_tenure_36_month_v2',
  'premium_tenure_36_month_v2': 'premium_tenure_60_month_v2',
  'premium_tenure_60_month_v2': 'premium_tenure_72_month_v2',
  'premium_tenure_72_month_v2': 'premium_tenure_72_month_v2',
};

// Mapeamento dos próximos níveis de Server Booster (adaptado do userinfo-module.js)
const nextBoosterLevel: { [key: string]: string } = {
  'guild_booster_lvl1': 'guild_booster_lvl2',
  'guild_booster_lvl2': 'guild_booster_lvl3',
  'guild_booster_lvl3': 'guild_booster_lvl4',
  'guild_booster_lvl4': 'guild_booster_lvl5',
  'guild_booster_lvl5': 'guild_booster_lvl6',
  'guild_booster_lvl6': 'guild_booster_lvl7',
  'guild_booster_lvl7': 'guild_booster_lvl8',
  'guild_booster_lvl8': 'guild_booster_lvl9',
  'guild_booster_lvl9': 'guild_booster_lvl9',
};

// Mapeamento dos meses necessários para cada nível de Server Booster (adaptado do userinfo-module.js)
const boosterDurations: { [key: string]: number } = {
  'guild_booster_lvl1': 1,
  'guild_booster_lvl2': 2,
  'guild_booster_lvl3': 3,
  'guild_booster_lvl4': 6,
  'guild_booster_lvl5': 9,
  'guild_booster_lvl6': 12,
  'guild_booster_lvl7': 15,
  'guild_booster_lvl8': 18,
  'guild_booster_lvl9': 24,
};

// Função para calcular a diferença de tempo em meses, dias e horas
function formatTimeDifference(startDate: string, monthsToAdd: number): string {
  const now = DateTime.now().setZone('utc');
  const targetDate = DateTime.fromISO(startDate, { zone: 'utc' }).plus({ months: monthsToAdd });

  if (now > targetDate) {
    return "Upgrade já realizado!";
  }

  const diff = targetDate.diff(now, ['months', 'days', 'hours']).toObject();

  const parts = [];
  if (diff.months && diff.months > 0) parts.push(`${Math.floor(diff.months)} mês${Math.floor(diff.months) > 1 ? 'es' : ''}`);
  if (diff.days && diff.days > 0) parts.push(`${Math.floor(diff.days)} dia${Math.floor(diff.days) > 1 ? 's' : ''}`);
  if (diff.hours && diff.hours > 0) parts.push(`${Math.floor(diff.hours)} hora${Math.floor(diff.hours) > 1 ? 's' : ''}`);

  return parts.length > 0 ? parts.join(' ') : 'Upgrade já realizado!';
}

// Função para calcular o tempo passado em anos, meses e dias
function formatTimeElapsed(startDate: string): string {
  const startLuxon = DateTime.fromISO(startDate).setZone('utc');
  const now = DateTime.now().setZone('utc');
  
  const diff = now.diff(startLuxon, ['years', 'months', 'days']).toObject();
  
  const parts = [];
  if (diff.years && diff.years > 0) parts.push(`${Math.floor(diff.years)} ano${Math.floor(diff.years) > 1 ? 's' : ''}`);
  if (diff.months && diff.months > 0) parts.push(`${Math.floor(diff.months)} mes${Math.floor(diff.months) > 1 ? 'es' : ''}`);
  if (diff.days && diff.days > 0) parts.push(`${Math.floor(diff.days)} dia${Math.floor(diff.days) > 1 ? 's' : ''}`);
  
  return parts.length > 0 ? `(${parts.join(' ')})` : 'Hoje';
}

// Função principal para processar os dados brutos e retornar o objeto final
export function processDiscordUserInfo(rawData: any, userId: string) {
  const user = rawData.user || {};
  const allBadges = new Set<string>();

  // Coletar insígnias de dados.badges
  if (rawData.badges) {
    rawData.badges.forEach((badge: { id: string }) => allBadges.add(badge.id));
  }

  // Coletar insígnias de public_flags
  const flags = user.public_flags || 0;
  const flagValues: { [key: number]: string } = {
    4: 'hypesquad',
    64: 'hypesquad_house_1',
    128: 'hypesquad_house_2',
    256: 'hypesquad_house_3',
    1: 'staff',
    2: 'partner',
    8: 'bug_hunter_level_1',
    16384: 'bug_hunter_level_2',
    512: 'early_supporter',
    262144: 'verified_developer',
    4194304: 'active_developer',
    67108864: 'legacy_username',
    268435456: 'quest_completed'
  };
  Object.entries(flagValues).forEach(([value, badgeId]) => {
    if (flags & parseInt(value)) {
      allBadges.add(badgeId);
    }
  });

  const badgesText = [...allBadges].map(id => badgeEmojis[id]).filter(Boolean).join(' ');

  // Cálculo da data de criação da conta (Snowflake)
  const creationTimestamp = Number((BigInt(userId) >> 22n) + 1420070400000n);
  const creationDate = DateTime.fromMillis(creationTimestamp, { zone: 'utc' });
  const creationDateFormatted = `${creationDate.setZone('America/Sao_Paulo').toLocaleString(DateTime.DATETIME_SHORT)} ${formatTimeElapsed(creationDate.toISO())}`;

  let nitroInfo = {
    signedNitroSince: 'N/A',
    nextNitroUpgrade: 'N/A',
    currentNitroBadge: 'N/A',
    nextNitroBadge: 'N/A',
  };

  // Lógica para Nitro Tenure
  if (rawData.premium_type && rawData.premium_since) {
    const nitroStartDate = DateTime.fromISO(rawData.premium_since, { zone: 'utc' });
    const nitroBadge = rawData.badges.find((b: { id: string }) => b.id.startsWith('premium_tenure'));

    nitroInfo.signedNitroSince = `${nitroStartDate.setZone('America/Sao_Paulo').toLocaleString(DateTime.DATETIME_SHORT)} ${formatTimeElapsed(nitroStartDate.toISO())}`;

    if (nitroBadge) {
      const nextBadgeId = nextNitroLevel[nitroBadge.id];
      nitroInfo.currentNitroBadge = badgeEmojis[nitroBadge.id] || '';

      if (nextBadgeId && nextBadgeId !== nitroBadge.id) {
        const nextDurationMonths = nitroDurations[nextBadgeId];
        const timeLeft = formatTimeDifference(nitroStartDate.toISO(), nextDurationMonths);
        nitroInfo.nextNitroUpgrade = `em ${timeLeft}`;
        nitroInfo.nextNitroBadge = badgeEmojis[nextBadgeId] || '';
      } else {
        nitroInfo.nextNitroUpgrade = 'Nível máximo';
        nitroInfo.nextNitroBadge = nitroInfo.currentNitroBadge;
      }
    }
  }

  let boosterInfo = {
    boosterSince: 'N/A',
    nextBoosterUpgrade: 'N/A',
    currentBoosterBadge: 'N/A',
    nextBoosterBadge: 'N/A',
  };

  // Lógica para Server Booster
  if (rawData.premium_guild_since) {
    const boosterStartDate = DateTime.fromISO(rawData.premium_guild_since, { zone: 'utc' });
    const boosterBadge = rawData.badges.find((b: { id: string }) => b.id.startsWith('guild_booster_lvl'));

    boosterInfo.boosterSince = `${boosterStartDate.setZone('America/Sao_Paulo').toLocaleString(DateTime.DATETIME_SHORT)} ${formatTimeElapsed(boosterStartDate.toISO())}`;

    if (boosterBadge) {
      const nextBadgeId = nextBoosterLevel[boosterBadge.id];
      boosterInfo.currentBoosterBadge = badgeEmojis[boosterBadge.id] || '🚀';

      if (nextBadgeId && nextBadgeId !== boosterBadge.id) {
        const monthsToAdd = boosterDurations[nextBadgeId] || (boosterDurations[boosterBadge.id] + 1);
        const timeLeft = formatTimeDifference(boosterStartDate.toISO(), monthsToAdd);
        boosterInfo.nextBoosterUpgrade = `em ${timeLeft}`;
        boosterInfo.nextBoosterBadge = badgeEmojis[nextBadgeId] || '🚀';
      } else {
        boosterInfo.nextBoosterUpgrade = 'Nível máximo';
        boosterInfo.nextBoosterBadge = boosterInfo.currentBoosterBadge;
      }
    }
  }

  // Construir o objeto userInfo final
  const userInfo = {
    // Dados básicos
    profilePicture: user.avatar ? `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png` : undefined,
    username: user.username || 'N/A',
    globalName: user.global_name || user.username || 'N/A',
    id: userId,
    badgesText: badgesText,
    
    // Datas calculadas
    accountCreationDate: creationDateFormatted,
    
    // Informações de Nitro
    ...nitroInfo,

    // Informações de Booster
    ...boosterInfo,

    // Todos os outros dados retornados pela API (para dados adicionais)
    rawData: rawData,
  };

  return userInfo;
}
