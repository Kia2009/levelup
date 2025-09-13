import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface AdminUser {
  id: number;
  user_id: string;
  coins: number;
  created_at: string;
}

interface AdminPanelProps {
  lang: 'en' | 'fa';
}

const API_URL = import.meta.env.VITE_API_URL;

const AdminPanel: React.FC<AdminPanelProps> = ({ lang }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [coinsToAdd, setCoinsToAdd] = useState<number>(0);
  const [addingCoins, setAddingCoins] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken({ template: 'fullname' });
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(lang === 'fa' ? 'شما دسترسی ادمین ندارید' : 'You do not have admin access');
        }
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoins = async () => {
    if (!selectedUser || coinsToAdd <= 0) return;

    try {
      setAddingCoins(true);
      const token = await getToken({ template: 'fullname' });
      const response = await fetch(`${API_URL}/admin/users/${selectedUser}/coins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: coinsToAdd }),
      });

      if (!response.ok) throw new Error('Failed to add coins');

      // بروزرسانی لیست کاربران
      await fetchUsers();
      setSelectedUser('');
      setCoinsToAdd(0);
      
      alert(lang === 'fa' ? 'سکه با موفقیت اضافه شد!' : 'Coins added successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingCoins(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        {lang === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2 className="admin-title">
        {lang === 'fa' ? '⚙️ پنل ادمین' : '⚙️ Admin Panel'}
      </h2>
      
      <div className="admin-actions">
        <div className="add-coins-section">
          <h3>{lang === 'fa' ? 'اضافه کردن سکه' : 'Add Coins'}</h3>
          <div className="add-coins-form">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="user-select"
            >
              <option value="">
                {lang === 'fa' ? 'انتخاب کاربر' : 'Select User'}
              </option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.user_id.substring(0, 20)}... ({user.coins} coins)
                </option>
              ))}
            </select>
            <input
              type="number"
              value={coinsToAdd}
              onChange={(e) => setCoinsToAdd(parseInt(e.target.value) || 0)}
              placeholder={lang === 'fa' ? 'تعداد سکه' : 'Amount'}
              min="1"
              className="coins-input"
            />
            <button
              onClick={handleAddCoins}
              disabled={!selectedUser || coinsToAdd <= 0 || addingCoins}
              className="add-coins-btn"
            >
              {addingCoins 
                ? (lang === 'fa' ? 'در حال اضافه کردن...' : 'Adding...') 
                : (lang === 'fa' ? 'اضافه کردن' : 'Add Coins')
              }
            </button>
          </div>
        </div>
      </div>

      <div className="users-list">
        <h3>{lang === 'fa' ? 'لیست کاربران' : 'Users List'}</h3>
        <div className="users-table">
          <div className="table-header">
            <div>{lang === 'fa' ? 'شناسه کاربر' : 'User ID'}</div>
            <div>{lang === 'fa' ? 'سکه' : 'Coins'}</div>
            <div>{lang === 'fa' ? 'تاریخ عضویت' : 'Join Date'}</div>
          </div>
          {users.map((user) => (
            <div key={user.user_id} className="table-row">
              <div className="user-id">
                {user.user_id.substring(0, 30)}...
              </div>
              <div className="user-coins">
                <svg viewBox="0 0 24 24" width="16" height="16" className="coin-icon">
                  <circle cx="12" cy="12" r="11" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5"/>
                  <text x="12" y="15" textAnchor="middle" fontSize="10" fill="#8B6508" fontWeight="bold">
                    IQ
                  </text>
                </svg>
                {user.coins}
              </div>
              <div className="user-date">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;