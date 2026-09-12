import React, { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

import { ConfigContext } from '../../../contexts/ConfigContext';
import useWindowSize from '../../../hooks/useWindowSize';

import NavLogo from './NavLogo';
import NavContent from './NavContent';
import navigation from '../../../menu-items';
import LogoutModel from '../NavBar/NavRight/LogoutModel';
import { logout } from '../../../redux/store/auth/Action';

const Navigation = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const configContext = useContext(ConfigContext);
  const { collapseMenu } = configContext.state;
  const windowSize = useWindowSize();
  const menuItems = navigation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogOut = () => {
    localStorage.removeItem('users');
    dispatch(logout());
    navigate('/login');
  };

  const userData = JSON.parse(localStorage.getItem('users')) || {};
  const userName = userData.name || userData.username || userData.email || 'Admin User';

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1:
        return 'Super Admin';
      case 2:
        return 'Admin';
      case 3:
        return 'Accountant';
      default:
        return 'Data Entry';
    }
  };
  const userRole = getRoleName(userData.role_id);
  const userInitials = userName.charAt(0).toUpperCase();

  let navClass = ['pcoded-navbar'];

  if (windowSize.width < 992 && collapseMenu) {
    navClass = [...navClass, 'mob-open'];
  } else if (collapseMenu) {
    navClass = [...navClass, 'navbar-collapsed'];
  }

  const userSection = (
    <div className="nav-user-section">
      <div className="user-info">
        <div className="user-avatar">{userInitials}</div>
        <div className="user-meta">
          <span className="user-name">{userName}</span>
          <span className="user-role">{userRole}</span>
        </div>
      </div>
      <button
        className="logout-btn"
        onClick={() => setShowLogoutModal(true)}
        title="Log Out"
        type="button"
      >
        <FiLogOut size={18} />
      </button>
    </div>
  );

  let navBarClass = ['navbar-wrapper'];

  let navContent = (
    <div className={navBarClass.join(' ')}>
      <NavLogo />
      <NavContent navigation={menuItems?.items} />
      {userSection}
    </div>
  );

  if (windowSize.width < 992) {
    navContent = (
      <div className="navbar-wrapper">
        <NavLogo />
        <NavContent navigation={menuItems?.items} />
        {userSection}
      </div>
    );
  }

  return (
    <React.Fragment>
      <nav className={navClass.join(' ')}>{navContent}</nav>
      {showLogoutModal && (
        <LogoutModel
          setShowModal={setShowLogoutModal}
          handleFun={handleLogOut}
          title="Confirm Log Out"
          subtitle="Are you sure you want to log out?"
          btnText="Log Out"
        />
      )}
    </React.Fragment>
  );
};

export default Navigation;
