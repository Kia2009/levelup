// badges.ts
import woodBadge from "../assets/badges/wood.png";
import metalBadge from "../assets/badges/metal.png";
import goldBadge from "../assets/badges/gold.png";
import diamondBadge from "../assets/badges/diamond.png";
// این فایل منطق مربوط به نشان‌ها (Badges) را بر اساس تعداد سکه‌های کاربر مدیریت می‌کند.

// تعریف ساختار داده‌ای برای یک نشان
export interface Badge {
  name: { en: string; fa: string }; // نام نشان به دو زبان
  icon: string; // مسیر آیکون نشان
  minCoins: number; // حداقل سکه برای دریافت این نشان
  maxCoins: number; // حداکثر سکه برای این نشان
}

// لیستی از تمام نشان‌های موجود در سیستم
export const BADGES: Badge[] = [
  {
    name: { en: "Student", fa: "دانش‌آموز" },
    icon: woodBadge,
    minCoins: 0,
    maxCoins: 9,
  },
  {
    name: { en: "Diligent", fa: "کوشا" },
    icon: metalBadge,
    minCoins: 10,
    maxCoins: 39,
  },
  {
    name: { en: "Smart", fa: "باهوش" },
    icon: goldBadge,
    minCoins: 40,
    maxCoins: 99,
  },
  {
    name: { en: "Elite", fa: "نخبه" },
    icon: diamondBadge,
    minCoins: 100,
    maxCoins: Infinity,
  },
];

/**
 * نشان فعلی کاربر را بر اساس تعداد سکه‌هایش برمی‌گرداند.
 * @param coins - تعداد سکه‌های کاربر.
 * @returns آبجکت Badge مربوط به کاربر.
 */
export function getBadge(coins: number): Badge {
  return (
    BADGES.find(
      (badge) => coins >= badge.minCoins && coins <= badge.maxCoins
    ) || BADGES[0]
  );
}

/**
 * نشان بعدی که کاربر می‌تواند به دست آورد را برمی‌گرداند.
 * @param coins - تعداد سکه‌های کاربر.
 * @returns آبجکت Badge بعدی یا null اگر کاربر به بالاترین سطح رسیده باشد.
 */
export function getNextBadge(coins: number): Badge | null {
  const currentIndex = BADGES.findIndex(
    (badge) => coins >= badge.minCoins && coins <= badge.maxCoins
  );
  return currentIndex < BADGES.length - 1 ? BADGES[currentIndex + 1] : null;
}

/**
 * درصد پیشرفت کاربر برای رسیدن به نشان بعدی را محاسبه می‌کند.
 * @param coins - تعداد سکه‌های کاربر.
 * @returns یک عدد بین ۰ تا ۱۰۰ که نشان‌دهنده درصد پیشرفت است.
 */
export function getProgress(coins: number): number {
  const currentBadge = getBadge(coins);
  const nextBadge = getNextBadge(coins);

  // اگر نشان بعدی وجود نداشته باشد، یعنی کاربر در بالاترین سطح است.
  if (!nextBadge) return 100;

  const range = nextBadge.minCoins - currentBadge.minCoins;
  const progressInLevel = coins - currentBadge.minCoins;

  const progress = (progressInLevel / range) * 100;

  // اطمینان از اینکه مقدار بین ۰ تا ۱۰۰ باقی می‌ماند.
  return Math.min(100, Math.max(0, progress));
}
