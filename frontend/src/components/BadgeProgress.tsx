// BadgeProgress.tsx

import React from 'react';
// ابزارهای کمکی برای دریافت اطلاعات نشان‌ها و محاسبه پیشرفت
import { getBadge, getNextBadge, getProgress } from '../utils/badges';

// تعریف پراپ‌های کامپوننت
interface BadgeProgressProps {
  coins: number; // تعداد سکه‌های کاربر
  lang: 'en' | 'fa'; // زبان فعلی
}

/**
 * کامپوننتی برای نمایش نوار پیشرفت کاربر برای رسیدن به نشان بعدی.
 */
const BadgeProgress: React.FC<BadgeProgressProps> = ({ coins, lang }) => {
  // دریافت اطلاعات نشان فعلی
  const currentBadge = getBadge(coins);
  // دریافت اطلاعات نشان بعدی
  const nextBadge = getNextBadge(coins);
  // محاسبه درصد پیشرفت
  const progress = getProgress(coins);

  return (
    <div className="badge-progress">
      {/* بخش نمایش اطلاعات نشان فعلی و بعدی */}
      <div className="badge-info">
        <div className="current-badge">
          <img src={currentBadge.icon} alt={currentBadge.name[lang]} className="badge-icon" />
          <span className="badge-name">{currentBadge.name[lang]}</span>
        </div>
        {/* اگر نشان بعدی وجود داشته باشد، آن را نمایش بده */}
        {nextBadge && (
          <div className="next-badge">
            <img src={nextBadge.icon} alt={nextBadge.name[lang]} className="badge-icon" />
            <span className="badge-name">{nextBadge.name[lang]}</span>
          </div>
        )}
      </div>
      
      {/* اگر نشان بعدی وجود داشته باشد، نوار پیشرفت را نمایش بده */}
      {nextBadge && (
        <div className="progress-container">
          <div className="progress-bar">
            {/* نوار پیشرفت که عرض آن بر اساس درصد محاسبه شده تنظیم می‌شود */}
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* متن نمایش دهنده تعداد سکه‌های فعلی از کل سکه‌های مورد نیاز */}
          <div className="progress-text">
            {coins} / {nextBadge.minCoins}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeProgress;
