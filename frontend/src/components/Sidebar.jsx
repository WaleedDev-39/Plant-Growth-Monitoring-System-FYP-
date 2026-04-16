import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAlerts } from '../api/alerts';
import toast from 'react-hot-toast';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard',  icon: 'fas fa-home',             path: '/' },
  { id: 'upload',    label: 'Analyze',    icon: 'fas fa-microscope',        path: '/upload' },
  { id: 'plants',    label: 'My Plants',  icon: 'fas fa-leaf',              path: '/plants' },
  { id: 'history',   label: 'History',    icon: 'fas fa-history',           path: '/history' },
  { id: 'analytics', label: 'Analytics',  icon: 'fas fa-chart-line',        path: '/analytics' },
  { id: 'alerts',    label: 'Alerts',     icon: 'fas fa-bell',              path: '/alerts', hasBadge: true },
  { id: 'profile',   label: 'Profile',    icon: 'fas fa-user-circle',       path: '/profile' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user) return;
      try {
        const res = await getAlerts(user._id);
        const alerts = res.data.data || [];
        setUnreadCount(alerts.filter(a => !a.isRead).length);
      } catch (e) { /* silent */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="logo">
        <i className="fas fa-seedling logo-icon"></i>
        {!collapsed && (
          <div className="logo-text">
            <h1>PlantMonitor</h1>
            <span>AI Growth System</span>
          </div>
        )}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} title="Toggle sidebar">
          <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
        </button>
      </div>

      {user && !collapsed && (
        <div className="sidebar-user">
          <div className="sidebar-avatar"><i className="fas fa-user"></i></div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.name}</span>
            <span className="sidebar-user-email">{user.email}</span>
          </div>
        </div>
      )}

      <ul className="nav-links">
        {menuItems.map(item => (
          <li
            key={item.id}
            className={location.pathname === item.path ? 'active' : ''}
            title={collapsed ? item.label : ''}
          >
            <Link to={item.path} style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', width: '100%' }}>
              <div className="nav-icon-wrap">
                <i className={item.icon}></i>
                {item.hasBadge && unreadCount > 0 && (
                  <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </div>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      <div className="sidebar-bottom">
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign Out">
          <i className="fas fa-sign-out-alt"></i>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;