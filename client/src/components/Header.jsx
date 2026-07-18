import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import ProfileMenu from './ProfileMenu';

function Header({ onCreateTask, onUpgrade }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <>
      <div className="topbar">
        <form className="search-box" onSubmit={handleSearch}>
          <Icon name="search" size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, tasks, teams..." />
          <kbd>/</kbd>
        </form>
        <div className="topbar-actions">
          <button className="icon-button" type="button" onClick={() => navigate('/notifications')} title="Notifications">
            <Icon name="bell" size={19} />
          </button>
          <button className="icon-button" type="button" onClick={() => navigate('/reports')} title="Reports help">
            <Icon name="circleHelp" size={19} />
          </button>
          <ProfileMenu />
        </div>
      </div>

      <header className="dashboard-header" id="dashboard">
        <div>
          <h2>Welcome back, Tejasya! <span className="wave">Wave</span></h2>
          <p>Here's what's happening with your projects today.</p>
        </div>

        <div className="header-actions">
          <button className="secondary-btn" onClick={onUpgrade}>Upgrade</button>
          <button className="primary-btn" onClick={onCreateTask}><Icon name="plus" size={16} /> Add Task</button>
        </div>
      </header>
    </>
  );
}

export default Header;
