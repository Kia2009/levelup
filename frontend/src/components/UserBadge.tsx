// UserBadge.tsx

import React from 'react';
// ابزارهای کمکی برای مدیریت نشان‌ها
import { getBadge } from '../utils/badges';

// تعریف پراپ‌های (props) کامپوننت
interface UserBadgeProps {
  coins: number; // تعداد سکه‌های کاربر
  lang: 'en' | 'fa'; // زبان فعلی برنامه
  size?: 'small' | 'medium'; // اندازه آیکون نشان (اختیاری)
  showTooltip?: boolean; // نمایش یا عدم نمایش تولتیپ (اختیاری)
  creator?: string; // نام کاربر برای نمایش در تولتیپ (اختیاری)
}

/**
 * کامپوننتی برای نمایش نشان (Badge) کاربر بر اساس تعداد سکه‌هایش.
 */
const UserBadge: React.FC<UserBadgeProps> = ({ 
  coins, 
  lang, 
  size = 'small', // مقدار پیش‌فرض برای اندازه
  showTooltip = false, // مقدار پیش‌فرض برای تولتیپ
  creator 
}) => {
  // دریافت اطلاعات نشان فعلی کاربر
  const badge = getBadge(coins);
  // تعیین کلاس CSS بر اساس اندازه
  const sizeClass = size === 'small' ? 'badge-small' : 'badge-medium';

  // ساخت متن تولتیپ در صورت فعال بودن
  const tooltipText = showTooltip ? `${creator}: ${badge.name[lang]} (${coins} سکه)` : '';

  return (
    <div className={`user-badge ${sizeClass}`} title={tooltipText}>
      {/* نمایش آیکون نشان */}
      <img src={badge.icon} alt={badge.name[lang]} className="badge-icon" />
    </div>
  );
};

export default UserBadge;
