export interface Badge {
  name: { en: string; fa: string };
  icon: string;
  minCoins: number;
  maxCoins: number;
}

export const BADGES: Badge[] = [
  { name: { en: "Student", fa: "دانش آموز" }, icon: "/src/assets/badges/wood.png", minCoins: 0, maxCoins: 9 },
  { name: { en: "Diligent", fa: "کوشا" }, icon: "/src/assets/badges/metal.png", minCoins: 10, maxCoins: 39 },
  { name: { en: "Smart", fa: "باهوش" }, icon: "/src/assets/badges/gold.png", minCoins: 40, maxCoins: 99 },
  { name: { en: "Elite", fa: "نخبه" }, icon: "/src/assets/badges/diamond.png", minCoins: 100, maxCoins: Infinity }
];

export function getBadge(coins: number): Badge {
  return BADGES.find(badge => coins >= badge.minCoins && coins <= badge.maxCoins) || BADGES[0];
}

export function getNextBadge(coins: number): Badge | null {
  const currentIndex = BADGES.findIndex(badge => coins >= badge.minCoins && coins <= badge.maxCoins);
  return currentIndex < BADGES.length - 1 ? BADGES[currentIndex + 1] : null;
}

export function getProgress(coins: number): number {
  const currentBadge = getBadge(coins);
  const nextBadge = getNextBadge(coins);
  
  if (!nextBadge) return 100;
  
  const progress = ((coins - currentBadge.minCoins) / (nextBadge.minCoins - currentBadge.minCoins)) * 100;
  return Math.min(100, Math.max(0, progress));
}