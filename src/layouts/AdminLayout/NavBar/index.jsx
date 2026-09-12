import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import NavRight from './NavRight';
import { logout } from '../../../redux/store/auth/Action';
import { ConfigContext } from '../../../contexts/ConfigContext';
import * as actionType from '../../../store/actions';
import LogoutModel from './NavRight/LogoutModel';
import Breadcrumb from '../Breadcrumb';

const NavBar = () => {
  const [moreToggle, setMoreToggle] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const dispath = useDispatch();
  const navigate = useNavigate();
  const configContext = useContext(ConfigContext);
  const { collapseMenu, layout } = configContext.state;
  const { dispatch } = configContext;

  const handleLogOut = () => {
    localStorage.removeItem('users');
    dispath(logout());
    navigate('/login');
  };

  let toggleClass = ['mobile-menu'];
  if (collapseMenu) {
    toggleClass = [...toggleClass, 'on'];
  }

  const navToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  let moreClass = ['mob-toggler'];
  let collapseClass = ['collapse navbar-collapse'];
  if (moreToggle) {
    moreClass = [...moreClass, 'on'];
    collapseClass = [...collapseClass, 'show'];
  }

  return (
    <React.Fragment>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: '#ffffff',
          borderBottom: '1px solid #e8eaf6',
          boxShadow: '0 2px 16px rgba(99,102,241,0.10)'
        }}
        className="navbar pcoded-header navbar-expand-lg"
      >
        {/* Right Header (Sticky Part) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            height: '70px',
            padding: '0 24px'
          }}
          className={collapseClass.join(' ')}
        >
          {/* Left — Breadcrumb / page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
            <Breadcrumb />
          </div>
          <NavRight setMoreToggle={setMoreToggle} setShowModal={setShowModal} />
        </div>
      </header>

      {showModal && (
        <LogoutModel
          setShowModal={setShowModal}
          handleFun={handleLogOut}
          title="Confirm Log Out"
          subtitle="Are you sure you want to log out?"
          btnText="Log Out"
        />
      )}
    </React.Fragment>
  );
};

export default NavBar;
