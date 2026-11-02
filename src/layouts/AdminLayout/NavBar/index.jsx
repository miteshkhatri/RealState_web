import React, { useContext, useState, useEffect, useRef } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef(null);
  const [isCustomerMode, setIsCustomerMode] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    if (typeof window.getMapPlotSuggestions === 'function') {
      const res = window.getMapPlotSuggestions(val);
      setSearchResults(res || []);
      setShowDropdown((res || []).length > 0);
    } else {
      const q = val.trim().toUpperCase();
      const list = (window.projectPlots || []).filter(p => {
        const pNo = String(p.plot_no || '').toUpperCase();
        const secP = (p.sector_name ? p.sector_name + '-' : '') + pNo;
        return pNo === q || pNo.includes(q) || secP.includes(q);
      }).map(p => {
        const sKey = (p.status_key || p.status || '').toLowerCase();
        let sLabel = '🟢 Available';
        let sColor = '#16a34a';
        if (p.is_booked === 1 || sKey === 'booked') {
          sLabel = '🔴 Booked';
          sColor = '#dc2626';
        } else if (sKey.includes('hold')) {
          sLabel = '🟡 Hold';
          sColor = '#d97706';
        } else if (sKey.includes('complete') || sKey.includes('regist')) {
          sLabel = '🔵 Registry';
          sColor = '#2563eb';
        } else if (sKey.includes('sold')) {
          sLabel = '🟣 Sold';
          sColor = '#8b5cf6';
        } else if (sKey.includes('uit')) {
          sLabel = '🔷 UIT Reserve';
          sColor = '#0891b2';
        } else if (sKey.includes('npc')) {
          sLabel = '🔶 NPC';
          sColor = '#e11d48';
        } else if (sKey === 'np') {
          sLabel = '🔸 NP';
          sColor = '#ea580c';
        } else if (sKey.includes('block')) {
          sLabel = '⬛ Blocked';
          sColor = '#475569';
        } else if (sKey.includes('reserv')) {
          sLabel = '🟤 Reserved';
          sColor = '#b45309';
        } else if (sKey.includes('pend')) {
          sLabel = '⏳ Pending';
          sColor = '#f59e0b';
        }
        return {
          label: (p.sector_name ? p.sector_name + '-' : '') + p.plot_no,
          pure: p.plot_no,
          status: sLabel,
          statusColor: sColor
        };
      });
      setSearchResults(list);
      setShowDropdown(list.length > 0);
    }
  };

  const handleSelectPlot = (label) => {
    setSearchQuery(label);
    setShowDropdown(false);
    if (typeof window.selectMapPlot === 'function') {
      window.selectMapPlot(label);
    } else {
      window.dispatchEvent(new CustomEvent('mapSelectPlot', { detail: label }));
    }
  };

  const handleFilterClick = (status) => {
    const next = activeFilter === status ? 'all' : status;
    setActiveFilter(next);
    if (typeof window.setMapFilter === 'function') {
      window.setMapFilter(next);
    } else {
      window.dispatchEvent(new CustomEvent('mapSetFilter', { detail: next }));
    }
  };

  const handleToggleCustomerMode = () => {
    const next = !isCustomerMode;
    setIsCustomerMode(next);
    if (typeof window.toggleMapCustomerMode === 'function') {
      window.toggleMapCustomerMode(next);
    } else {
      window.dispatchEvent(new CustomEvent('mapToggleCustomerMode', { detail: next }));
    }
  };

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

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
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
      <style>{`
        /* Map Header Base & Responsive Rules */
        header.pcoded-header.map-header-active {
          position: sticky !important;
          top: 0 !important;
          z-index: 1000 !important;
          background: #ffffff !important;
          border-bottom: 1px solid #e8eaf6 !important;
          box-shadow: 0 2px 14px rgba(99,102,241,0.08) !important;
        }

        /* Ensure header collapse is always visible on map page */
        header.pcoded-header.map-header-active .navbar-collapse {
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Desktop View (>= 992px) */
        @media (min-width: 992px) {
          .map-navbar-container {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
            height: 70px !important;
            padding: 0 16px !important;
            gap: 8px !important;
          }
          .map-navbar-top-row {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            flex-wrap: nowrap !important;
            min-width: 0 !important;
            flex-shrink: 0 !important;
          }
          .map-navbar-controls {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            flex-wrap: nowrap !important;
            flex-shrink: 0 !important;
          }
          .map-navright-mobile {
            display: none !important;
          }
          .map-navright-desktop {
            display: flex !important;
            align-items: center !important;
            flex-shrink: 0 !important;
            margin-left: auto !important;
          }
        }

        /* Mobile / Tablet View (< 992px) */
        @media (max-width: 991.98px) {
          header.pcoded-header.map-header-active {
            height: auto !important;
            min-height: 52px !important;
            padding: 0 !important;
          }
          .map-navbar-container {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            width: 100% !important;
            height: auto !important;
            padding: 8px 12px 8px 12px !important;
            gap: 7px !important;
          }
          .map-navbar-top-row {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
          }
          .map-navbar-separator {
            display: none !important;
          }
          .map-navbar-controls {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            width: 100% !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
            padding: 2px 2px 4px 2px !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .map-navbar-controls::-webkit-scrollbar {
            display: none !important;
          }
          .map-navright-desktop {
            display: none !important;
          }
          .map-navright-mobile {
            display: flex !important;
            align-items: center !important;
            flex-shrink: 0 !important;
          }
        }
      `}</style>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: '#ffffff',
          borderBottom: '1px solid #e8eaf6',
          boxShadow: '0 2px 16px rgba(99,102,241,0.10)'
        }}
        className={`navbar pcoded-header navbar-expand-lg ${isMapPage ? 'map-header-active' : ''}`}
      >
        {/* Responsive Header Container */}
        <div className={`map-navbar-container ${collapseClass.join(' ')}`}>
          {/* Top Row on Mobile / Left Section on Desktop */}
          <div className="map-navbar-top-row">
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <Breadcrumb />
            </div>

            {/* Vertical Separator (Desktop Only) */}
            {isMapPage && (
              <span
                className="map-navbar-separator"
                style={{
                  width: '1px',
                  height: '20px',
                  background: '#e2e8f0',
                  margin: '0 1px',
                  display: 'inline-block',
                  flexShrink: 0
                }}
              />
            )}

            {/* Mobile NavRight (Theme + Profile) sitting on top-right of Row 1 */}
            <div className="map-navright-mobile">
              <NavRight setMoreToggle={setMoreToggle} setShowModal={setShowModal} />
            </div>
          </div>

          {/* Map Controls: Desktop inline, Mobile Row 2 (horizontal scrollable swipe bar) */}
          {isMapPage && (
            <div className="map-navbar-controls">
              {/* 🔍 Search Input with Live Autocomplete */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  placeholder={isSearchFocused ? "प्लॉट (22, B-10)..." : "🔍 खोजें प्लॉट..."}
                  onChange={handleSearchChange}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                    width: isSearchFocused ? '155px' : '110px',
                    height: '28px',
                    outline: 'none',
                    background: '#f8fafc',
                    transition: 'all 0.22s ease',
                  }}
                  onFocus={(e) => {
                    setIsSearchFocused(true);
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.background = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 2.5px rgba(37,99,235,0.12)';
                    if (searchQuery.trim() && searchResults.length > 0) setShowDropdown(true);
                  }}
                  onBlur={(e) => {
                    setIsSearchFocused(false);
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.background = '#f8fafc';
                    e.target.style.boxShadow = 'none';
                    setTimeout(() => setShowDropdown(false), 250);
                  }}
                />
                {showDropdown && searchResults.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '210px',
                      maxHeight: '250px',
                      overflowY: 'auto',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      marginTop: '5px',
                      zIndex: 999999
                    }}
                  >
                    {searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        onMouseDown={() => handleSelectPlot(item.label)}
                        style={{
                          padding: '6px 10px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '11.5px'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ fontWeight: '700', color: '#1e293b' }}>
                          Plot {item.pure} <small style={{ color: '#64748b', fontWeight: '400' }}>({item.label})</small>
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: item.statusColor }}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 🏷️ Status Filter Dropdown */}
              {(() => {
                const statusOptions = [
                  {
                    key: 'all',
                    label: 'All Plots',
                    color: '#2563eb',
                    dotColor: '#3b82f6',
                    badgeBg: '#eff6ff',
                    badgeColor: '#1d4ed8',
                    count: plotStats?.total || 0,
                  },
                  {
                    key: 'booked',
                    label: 'Booked',
                    color: '#dc2626',
                    dotColor: '#ef4444',
                    badgeBg: '#fee2e2',
                    badgeColor: '#991b1b',
                    count: plotStats?.booked || 0,
                  },
                  {
                    key: 'hold',
                    label: 'Hold',
                    color: '#d97706',
                    dotColor: '#f59e0b',
                    badgeBg: '#fef3c7',
                    badgeColor: '#92400e',
                    count: plotStats?.hold || 0,
                  },
                  {
                    key: 'available',
                    label: 'Available',
                    color: '#16a34a',
                    dotColor: '#22c55e',
                    badgeBg: '#dcfce7',
                    badgeColor: '#166534',
                    count: plotStats?.available || 0,
                  },
                  {
                    key: 'npc',
                    label: 'NPC',
                    color: '#e11d48',
                    dotColor: '#f43f5e',
                    badgeBg: '#ffe4e6',
                    badgeColor: '#be123c',
                    count: plotStats?.npc || 0,
                  },
                  {
                    key: 'completed',
                    label: 'Registry',
                    color: '#2563eb',
                    dotColor: '#3b82f6',
                    badgeBg: '#dbeafe',
                    badgeColor: '#1e40af',
                    count: plotStats?.completed || 0,
                    showIfZero: false,
                  },
                  {
                    key: 'sold',
                    label: 'Sold',
                    color: '#7c3aed',
                    dotColor: '#8b5cf6',
                    badgeBg: '#ede9fe',
                    badgeColor: '#5b21b6',
                    count: plotStats?.sold || 0,
                    showIfZero: false,
                  },
                  {
                    key: 'uit_reserve',
                    label: 'UIT Reserve',
                    color: '#0891b2',
                    dotColor: '#06b6d4',
                    badgeBg: '#cffafe',
                    badgeColor: '#0e7490',
                    count: plotStats?.uit_reserve || 0,
                    showIfZero: false,
                  },
                  {
                    key: 'np',
                    label: 'NP',
                    color: '#ea580c',
                    dotColor: '#f97316',
                    badgeBg: '#ffedd5',
                    badgeColor: '#9a3412',
                    count: plotStats?.np || 0,
                    showIfZero: false,
                  },
                  {
                    key: 'blocked',
                    label: 'Blocked',
                    color: '#475569',
                    dotColor: '#64748b',
                    badgeBg: '#e2e8f0',
                    badgeColor: '#334155',
                    count: plotStats?.blocked || 0,
                    showIfZero: false,
                  },
                  {
                    key: 'pending',
                    label: 'Pending',
                    color: '#d97706',
                    dotColor: '#f59e0b',
                    badgeBg: '#fef3c7',
                    badgeColor: '#92400e',
                    count: plotStats?.pending || 0,
                    showIfZero: false,
                  },
                  {
                    key: 'uncreated',
                    label: 'Not in Project',
                    color: '#64748b',
                    dotColor: '#94a3b8',
                    isDashed: true,
                    badgeBg: '#f8fafc',
                    badgeColor: '#475569',
                    count: null,
                  },
                ];

                const currentOption = statusOptions.find(o => o.key === activeFilter) || statusOptions[0];

                return (
                  <div ref={statusDropdownRef} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      style={{
                        height: '28px',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: activeFilter === 'all' ? '#ffffff' : currentOption.badgeBg,
                        border: activeFilter === 'all' ? '1px solid #cbd5e1' : `1.5px solid ${currentOption.color}`,
                        color: currentOption.badgeColor || '#334155',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: showStatusDropdown ? '0 0 0 2px rgba(37,99,235,0.18)' : 'none',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: currentOption.dotColor || '#2563eb',
                          display: 'inline-block',
                          border: currentOption.isDashed ? '1.5px dashed #94a3b8' : 'none',
                          flexShrink: 0
                        }}
                      />
                      <span>{currentOption.label}</span>
                      {currentOption.count !== null && currentOption.count !== undefined && (
                        <span
                          style={{
                            background: currentOption.color || '#2563eb',
                            color: '#ffffff',
                            borderRadius: '10px',
                            padding: '0 5px',
                            fontSize: '9.5px',
                            fontWeight: '700',
                            lineHeight: '1.4',
                            display: 'inline-block'
                          }}
                        >
                          {currentOption.count}
                        </span>
                      )}
                      <span style={{ fontSize: '9px', color: '#64748b', marginLeft: '1px' }}>
                        {showStatusDropdown ? '▲' : '▼'}
                      </span>
                    </button>

                    {showStatusDropdown && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          left: 0,
                          minWidth: '185px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.06)',
                          padding: '4px',
                          zIndex: 999999,
                        }}
                      >
                        <div style={{ padding: '4px 8px 5px', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Filter by Status
                        </div>
                        {statusOptions
                          .filter(opt => opt.showIfZero === false ? Boolean(opt.count) : true)
                          .map(opt => {
                            const isSelected = activeFilter === opt.key;
                            return (
                              <div
                                key={opt.key}
                                onClick={() => {
                                  handleFilterClick(opt.key);
                                  setShowStatusDropdown(false);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '5px 8px',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  background: isSelected ? '#f1f5f9' : 'transparent',
                                  fontWeight: isSelected ? '700' : '500',
                                  fontSize: '11.5px',
                                  color: isSelected ? '#0f172a' : '#334155',
                                  transition: 'background 0.12s ease',
                                  marginBottom: '1px'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                  <span
                                    style={{
                                      width: '7.5px',
                                      height: '7.5px',
                                      borderRadius: '50%',
                                      background: opt.dotColor,
                                      border: opt.isDashed ? '1.5px dashed #94a3b8' : 'none',
                                      flexShrink: 0
                                    }}
                                  />
                                  <span>{opt.label}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  {opt.count !== null && opt.count !== undefined && (
                                    <span
                                      style={{
                                        background: isSelected ? opt.color : '#e2e8f0',
                                        color: isSelected ? '#ffffff' : '#475569',
                                        borderRadius: '10px',
                                        padding: '0 5px',
                                        fontSize: '9.5px',
                                        fontWeight: '700',
                                        lineHeight: '1.4'
                                      }}
                                    >
                                      {opt.count}
                                    </span>
                                  )}
                                  {isSelected && (
                                    <span style={{ color: '#2563eb', fontSize: '11px', fontWeight: 'bold' }}>✓</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 👤 Customer Mode Toggle */}
              <button
                onClick={handleToggleCustomerMode}
                title="ग्राहक को दिखाते समय प्राइवेसी ऑन/ऑफ करें"
                style={{
                  padding: '3px 9px',
                  height: '28px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  border: 'none',
                  background: isCustomerMode ? '#10b981' : '#475569',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: isCustomerMode ? '0 0 0 2px rgba(16,185,129,0.25)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                👤 Customer: {isCustomerMode ? 'ON' : 'OFF'}
              </button>
            </div>
          )}

          {/* Desktop NavRight on the far right */}
          <div className="map-navright-desktop">
            <NavRight setMoreToggle={setMoreToggle} setShowModal={setShowModal} />
          </div>
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
