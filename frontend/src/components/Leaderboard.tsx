import React, { useState, useEffect } from 'react';

interface LeaderboardEntry {
  user_id: string;
  coins: number;
  rank: number;
}

interface LeaderboardProps {
  lang: 'en' | 'fa';
}

const API_URL = import.meta.env.VITE_API_URL;

const Leaderboard: React.FC<LeaderboardProps> = ({ lang }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_URL}/leaderboard`);
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        const data = await response.json();
        setLeaderboard(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className="leaderboard-loading">
        {lang === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-error">
        {error}
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">
        {lang === 'fa' ? '🏆 لیدربورد' : '🏆 Leaderboard'}
      </h2>
      <div className="leaderboard-list">
        {leaderboard.map((entry) => (
          <div key={entry.user_id} className={`leaderboard-item rank-${entry.rank}`}>
            <div className="leaderboard-rank">
              {getRankIcon(entry.rank)}
            </div>
            <div className="leaderboard-user">
              {entry.user_id.substring(0, 8)}...
            </div>
            <div className="leaderboard-coins">
              <svg viewBox="0 0 24 24" width="20" height="20" className="coin-icon">
                <circle cx="12" cy="12" r="11" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5"/>
                <text x="12" y="15" textAnchor="middle" fontSize="10" fill="#8B6508" fontWeight="bold">
                  IQ
                </text>
              </svg>
              {entry.coins}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;