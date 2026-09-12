import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiUser, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useNavigate } from 'react-router-dom';
import ChatList from './ChatList';
import LogoutModel from './LogoutModel';
import avatar1 from '../../../../assets/images/user/avatar-1.jpg';
import avatar2 from '../../../../assets/images/user/avatar-2.jpg';
import avatar3 from '../../../../assets/images/user/avatar-3.jpg';
import avatar4 from '../../../../assets/images/user/avatar-4.jpg';
import { API_BASE_URL } from 'config/constant';
import { logout } from '../../../../redux/store/auth/Action';
import { useDispatch } from 'react-redux';

const NavRight = ({ setMoreToggle, setShowModal }) => {
  const [listOpen, setListOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const dispatch = useDispatch();

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const notiData = [
    {
      name: 'Joseph William',
      image: avatar2,
      details: 'Purchase New Theme and make payment',
      activity: '30 min'
    },
    {
      name: 'Sara Soudein',
      image: avatar3,
      details: 'currently login',
      activity: '30 min'
    },
    {
      name: 'Suzen',
      image: avatar4,
      details: 'Purchase New Theme and make payment',
      activity: 'yesterday'
    }
  ];
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('users'));
  // const objUserData = userData && userData.length > 0 ? userData[0] : null;

  const [showDropdown, setShowDropdown] = useState(false);

  // const handleLogOut = () => {
  //   localStorage.removeItem('users');
  //   dispatch(logout());
  //   navigate('/login');
  // };

  return (
    <React.Fragment>
      <ul className="navbar-nav ml-auto d-flex align-items-center flex-row" id="navbar-right" style={{ gap: '8px', margin: 0, padding: 0, listStyle: 'none', justifyContent: 'flex-end' }}>
        
        {/* ─── Theme Toggle Button ─── */}
        <li className="d-flex align-items-center m-0 p-0" style={{ listStyle: 'none' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,0,0,0.05)',
              color: 'var(--text-secondary, #6b7280)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              transition: 'all 0.2s',
              outline: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </li>

        {/* ─── User Profile Dropdown ─── */}
        <li className="d-flex align-items-center m-0 p-0" style={{ listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Dropdown
            align={'end'}
            className="drp-user"
            show={showDropdown}
            onToggle={(isOpen) => setShowDropdown(isOpen)}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Dropdown.Toggle 
              as={Link} 
              variant="link" 
              to="#" 
              id="dropdown-basic" 
              className="p-0 border-0 d-flex align-items-center" 
              style={{ 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '38px',
                outline: 'none',
                border: 'none'
              }}
            >
              <img
                src={userData?.image ? `${API_BASE_URL}/uploads/${userData?.image}` : avatar2}
                alt="User Profile"
                className="rounded-circle"
                style={{
                  width: '38px',
                  height: '38px',
                  objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              />
            </Dropdown.Toggle>

            <Dropdown.Menu
              align="end"
              className="profile-notification shadow-lg p-0"
              style={{
                minWidth: '220px',
                width: '260px',
                maxWidth: 'calc(100vw - 32px)',
                backgroundColor: 'var(--bg-card, #ffffff)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                transition: 'all 0.25s ease',
              }}
            >
              {/* Profile header */}
              <div
                className="pro-head text-center py-3"
                style={{ 
                  cursor: 'pointer', 
                  color: 'var(--text-primary, #1e293b)',
                  background: 'var(--bg-card-hover, #f8fafc)',
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onClick={() => {
                  navigate('/profile');
                  setShowDropdown(false);
                  setMoreToggle(false);
                }}
              >
                <img
                  src={userData?.image ? `${API_BASE_URL}/uploads/${userData?.image}` : avatar2}
                  alt="User"
                  className="rounded-circle"
                  style={{
                    width: '46px',
                    height: '46px',
                    objectFit: 'cover',
                    border: '2px solid #ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: '0.9rem', 
                  color: 'var(--text-primary, #1e293b)' 
                }}>
                  {userData?.name || 'User Name'}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-secondary, #64748b)', 
                  marginTop: '-4px' 
                }}>
                  {userData?.role_name || 'Administrator'}
                </div>
              </div>

              {/* Menu items */}
              <ul className="pro-body" style={{ padding: '8px 0', margin: 0, listStyle: 'none' }}>
                <li
                  className="dropdown-item py-2 px-3 d-flex align-items-center gap-2"
                  onClick={() => {
                    navigate('/profile');
                    setShowDropdown(false);
                    setMoreToggle(false);
                  }}
                  style={{
                    cursor: 'pointer',
                    color: 'var(--text-secondary, #475569)',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    transition: 'all 0.2s',
                    margin: '0 8px',
                    borderRadius: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
                    e.currentTarget.style.color = '#0f172a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary, #475569)';
                  }}
                >
                  <FiUser size={16} style={{ color: 'inherit' }} />
                  <span>Profile</span>
                </li>

                {/* Separator */}
                <div style={{ 
                  height: '1px', 
                  backgroundColor: 'rgba(0,0,0,0.08)', 
                  margin: '4px 8px' 
                }} />

                <li
                  className="dropdown-item py-2 px-3 d-flex align-items-center gap-2"
                  onClick={() => {
                    setShowDropdown(false);
                    setMoreToggle(false);
                    setShowModal(true);
                  }}
                  style={{
                    cursor: 'pointer',
                    color: '#ef4444',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    transition: 'all 0.2s',
                    margin: '0 8px',
                    borderRadius: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <FiLogOut size={16} style={{ color: 'inherit' }} />
                  <span>Log Out</span>
                </li>
              </ul>
            </Dropdown.Menu>
          </Dropdown>
        </li>
      </ul>
    </React.Fragment>
  );
};

export default NavRight;