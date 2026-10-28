import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isMapPage = location.pathname.includes('/project/map');
  const [plotStats, setPlotStats] = useState(() => window.mapPlotStats || null);

  const configContext = useContext(ConfigContext);
  const { collapseMenu, layout } = configContext.state;
  const { dispatch } = configContext;

  useEffect(() => {
    const handleStatsUpdate = (e) => {
      if (e.detail) setPlotStats(e.detail);
    };
    window.addEventListener('mapPlotStatsUpdated', handleStatsUpdate);
    return () => window.removeEventListener('mapPlotStatsUpdated', handleStatsUpdate);
  }, []);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <Breadcrumb />
            {/* Vertical Separator between Breadcrumb and Legend */}
            {isMapPage && (
              <span
                style={{
                  width: '1px',
                  height: '24px',
                  background: '#e2e8f0',
                  margin: '0 4px',
                  display: 'inline-block',
                  flexShrink: 0
                }}
              />
            )}

            {/* Map Legend — Modern Card Chips */}
            {isMapPage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                {/* 🔴 Booked Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '5px 12px 5px 10px',
                    boxShadow: '0 1px 2px rgba(239, 68, 68, 0.06)',
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      background: '#ef4444',
                      borderRadius: '50%',
                      display: 'inline-block',
                      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.2)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: '#991b1b',
                      fontSize: '12px',
                      fontWeight: '600',
                      letterSpacing: '0.2px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Booked
                  </span>
                  {plotStats?.booked !== undefined && (
                    <span
                      style={{
                        background: '#ef4444',
                        color: '#ffffff',
                        borderRadius: '6px',
                        padding: '1px 8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        minWidth: '20px',
                        textAlign: 'center',
                        lineHeight: '1.4',
                      }}
                    >
                      {plotStats.booked}
                    </span>
                  )}
                </div>

                {/* 🟢 Available Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '5px 12px 5px 10px',
                    boxShadow: '0 1px 2px rgba(34, 197, 94, 0.06)',
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      background: '#22c55e',
                      borderRadius: '50%',
                      display: 'inline-block',
                      boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: '#166534',
                      fontSize: '12px',
                      fontWeight: '600',
                      letterSpacing: '0.2px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Available
                  </span>
                  {plotStats?.available !== undefined && (
                    <span
                      style={{
                        background: '#16a34a',
                        color: '#ffffff',
                        borderRadius: '6px',
                        padding: '1px 8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        minWidth: '20px',
                        textAlign: 'center',
                        lineHeight: '1.4',
                      }}
                    >
                      {plotStats.available}
                    </span>
                  )}
                </div>

                {/* ⚪ Plot Not Created Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '5px 12px 5px 10px',
                    boxShadow: '0 1px 2px rgba(100, 116, 139, 0.04)',
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      background: '#ffffff',
                      border: '2px dashed #94a3b8',
                      borderRadius: '50%',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: '#64748b',
                      fontSize: '12px',
                      fontWeight: '500',
                      letterSpacing: '0.2px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Plot Not Created in Project
                  </span>
                </div>
              </div>
            )}
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
