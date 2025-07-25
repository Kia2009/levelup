import React from 'react';
import { getBadge, getNextBadge, getProgress } from '../utils/badges';

interface BadgeProgressProps {
  coins: number;
  lang: 'en' | 'fa';
}

const BadgeProgress: React.FC<BadgeProgressProps> = ({ coins, lang }) => {
  const currentBadge = getBadge(coins);
  const nextBadge = getNextBadge(coins);
  const progress = getProgress(coins);

  return (
    <div className="badge-progress">
      <div className="badge-info">
        <div className="current-badge">
          <img src={currentBadge.icon} alt={currentBadge.name[lang]} className="badge-icon" />
          <span className="badge-name">{currentBadge.name[lang]}</span>
        </div>
        {nextBadge && (
          <div className="next-badge">
            <img src={nextBadge.icon} alt={nextBadge.name[lang]} className="badge-icon" />
            <span className="badge-name">{nextBadge.name[lang]}</span>
          </div>
        )}
      </div>
      
      {nextBadge && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">
            {coins} / {nextBadge.minCoins}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeProgress;