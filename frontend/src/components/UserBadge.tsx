import React from 'react';
import { getBadge } from '../utils/badges';

interface UserBadgeProps {
  coins: number;
  lang: 'en' | 'fa';
  size?: 'small' | 'medium';
  showTooltip?: boolean;
  creator?: string;
}

const UserBadge: React.FC<UserBadgeProps> = ({ 
  coins, 
  lang, 
  size = 'small', 
  showTooltip = false,
  creator 
}) => {
  const badge = getBadge(coins);
  const sizeClass = size === 'small' ? 'badge-small' : 'badge-medium';

  return (
    <div className={`user-badge ${sizeClass}`} title={showTooltip ? `${creator}: ${badge.name[lang]} (${coins} coins)` : ''}>
      <img src={badge.icon} alt={badge.name[lang]} className="badge-icon" />
    </div>
  );
};

export default UserBadge;