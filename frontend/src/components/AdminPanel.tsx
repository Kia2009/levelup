import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

interface AdminUser {
  id: number;
  user_id: string;
  coins: number;
  created_at: string;
}

interface AdminPanelProps {
  lang: "en" | "fa";
  showAlert?: (message: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

const AdminPanel: React.FC<AdminPanelProps> = ({ lang, showAlert }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [coinsToAdd, setCoinsToAdd] = useState<number>(0);
  const [addingCoins, setAddingCoins] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"coins" | "date">("coins");
  const { getToken } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken({ template: "fullname" });
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            lang === "fa"
              ? "شما دسترسی ادمین ندارید"
              : "You do not have admin access"
          );
        }
        throw new Error("Failed to fetch users");
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
      const token = await getToken({ template: "fullname" });
      const response = await fetch(
        `${API_URL}/admin/users/${selectedUser}/coins`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: coinsToAdd }),
        }
      );

      if (!response.ok) throw new Error("Failed to add coins");

      // بروزرسانی لیست کاربران
      await fetchUsers();
      setSelectedUser("");
      setCoinsToAdd(0);

      if (showAlert)
        showAlert(
          lang === "fa"
            ? "سکه با موفقیت اضافه شد!"
            : "Coins added successfully!"
        );
    } catch (err: any) {
      if (showAlert) showAlert(err.message);
    } finally {
      setAddingCoins(false);
    }
  };

  const filteredUsers = users
    .filter(user => 
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "coins") {
        return b.coins - a.coins;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <span>{lang === "fa" ? "در حال بارگذاری..." : "Loading..."}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel">
        <div className="admin-error">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#ef4444"/>
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-title-section">
          <div className="admin-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 7l-8 4v6l8 4 8-4v-6l-8-4z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h2 className="admin-title">
              {lang === "fa" ? "پنل ادمین" : "Admin Panel"}
            </h2>
            <p className="admin-subtitle">
              {lang === "fa" ? "مدیریت کاربران و سکه‌ها" : "Manage users and coins"}
            </p>
          </div>
        </div>
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{users.length}</div>
            <div className="stat-label">{lang === "fa" ? "کاربران" : "Users"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{users.reduce((sum, user) => sum + user.coins, 0)}</div>
            <div className="stat-label">{lang === "fa" ? "کل سکه‌ها" : "Total Coins"}</div>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <div className="add-coins-section">
          <div className="section-header">
            <h3>{lang === "fa" ? "اضافه کردن سکه" : "Add Coins"}</h3>
            <div className="section-icon">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5"/>
                <path d="M12 8v8M8 12h8" stroke="#8B6508" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className="add-coins-form">
            <div className="form-group">
              <label>{lang === "fa" ? "انتخاب کاربر" : "Select User"}</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="user-select"
              >
                <option value="">
                  {lang === "fa" ? "انتخاب کاربر" : "Select User"}
                </option>
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.user_id.substring(0, 25)}... ({user.coins} coins)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{lang === "fa" ? "تعداد سکه" : "Amount"}</label>
              <input
                type="number"
                value={coinsToAdd}
                onChange={(e) => setCoinsToAdd(parseInt(e.target.value) || 0)}
                placeholder={lang === "fa" ? "تعداد سکه" : "Amount"}
                min="1"
                className="coins-input"
              />
            </div>
            <button
              onClick={handleAddCoins}
              disabled={!selectedUser || coinsToAdd <= 0 || addingCoins}
              className="add-coins-btn"
            >
              {addingCoins && (
                <div className="btn-spinner"></div>
              )}
              <span>
                {addingCoins
                  ? lang === "fa"
                    ? "در حال اضافه کردن..."
                    : "Adding..."
                  : lang === "fa"
                  ? "اضافه کردن"
                  : "Add Coins"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="users-list">
        <div className="users-list-header">
          <h3>{lang === "fa" ? "لیست کاربران" : "Users List"}</h3>
          <div className="list-controls">
            <div className="search-box">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              <input
                type="text"
                placeholder={lang === "fa" ? "جستجو کاربر..." : "Search users..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sort-controls">
              <button
                className={`sort-btn ${sortBy === "coins" ? "active" : ""}`}
                onClick={() => setSortBy("coins")}
              >
                {lang === "fa" ? "سکه" : "Coins"}
              </button>
              <button
                className={`sort-btn ${sortBy === "date" ? "active" : ""}`}
                onClick={() => setSortBy("date")}
              >
                {lang === "fa" ? "تاریخ" : "Date"}
              </button>
            </div>
          </div>
        </div>
        
        <div className="users-table">
          <div className="table-header">
            <div className="header-cell user-id-header">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              {lang === "fa" ? "شناسه کاربر" : "User ID"}
            </div>
            <div className="header-cell coins-header">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5"/>
                <text x="12" y="15" textAnchor="middle" fontSize="8" fill="#8B6508" fontWeight="bold">IQ</text>
              </svg>
              {lang === "fa" ? "سکه" : "Coins"}
            </div>
            <div className="header-cell date-header">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {lang === "fa" ? "تاریخ عضویت" : "Join Date"}
            </div>
          </div>
          <div className="table-body">
            {filteredUsers.map((user, index) => (
              <div key={user.user_id} className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                <div className="table-cell user-id">
                  <div className="user-avatar">
                    {user.user_id.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="user-id-text">{user.user_id.substring(0, 30)}...</span>
                </div>
                <div className="table-cell user-coins">
                  <div className="coins-display">
                    <svg viewBox="0 0 24 24" width="18" height="18" className="coin-icon">
                      <circle cx="12" cy="12" r="11" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5"/>
                      <text x="12" y="15" textAnchor="middle" fontSize="10" fill="#8B6508" fontWeight="bold">IQ</text>
                    </svg>
                    <span className="coins-amount">{user.coins.toLocaleString()}</span>
                  </div>
                </div>
                <div className="table-cell user-date">
                  <span className="date-text">{new Date(user.created_at).toLocaleDateString()}</span>
                  <span className="date-relative">
                    {Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))} 
                    {lang === "fa" ? " روز پیش" : " days ago"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="no-users">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            <p>{lang === "fa" ? "کاربری یافت نشد" : "No users found"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
