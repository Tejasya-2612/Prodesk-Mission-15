import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

function ProfileMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={`profile-menu ${open ? 'open' : ''}`}>
      <button className="avatar avatar-button" type="button" onClick={() => setOpen(!open)}>{user?.name?.charAt(0).toUpperCase() || 'U'}</button>
      <div className="profile-copy">
        <strong>{user?.name}</strong>
        <span>{user?.email}</span>
      </div>
      <button onClick={handleLogout}><Icon name="logOut" size={15} /> Logout</button>
    </div>
  );
}

export default ProfileMenu;
