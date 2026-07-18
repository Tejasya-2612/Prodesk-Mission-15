import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

function Sidebar() {
  const { user } = useAuth();
  const items = [
    ['Dashboard', '/dashboard', 'grid'],
    ['Projects', '/projects', 'briefcase'],
    ['Boards', '/boards', 'board'],
    ['Tasks', '/tasks', 'check'],
    ['Calendar', '/calendar', 'calendar'],
    ['Reports', '/reports', 'chart'],
    ['Team', '/team', 'users'],
    ['Messages', '/messages', 'message'],
    ['Files', '/files', 'file'],
    ['Settings', '/settings', 'gear']
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">T</div>
        <h1>TaskMatrix</h1>
      </div>

      <nav className="side-nav">
        {items.map(([item, path, icon]) => (
          <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={path} key={item}>
            <Icon className="nav-icon" name={icon} />
            {item}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="mini-avatar">{initials(user?.name)}</div>
          <div>
            <strong>{user?.name || 'User'}</strong>
            <span>{user?.role || 'Member'}</span>
          </div>
        </div>
        <div className="workspace-label">Workspace</div>
        <div className="workspace-name">
          <Icon name="briefcase" size={16} />
          TaskMatrix Team
        </div>
      </div>
    </aside>
  );
}

function initials(name = 'User') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export default Sidebar;
