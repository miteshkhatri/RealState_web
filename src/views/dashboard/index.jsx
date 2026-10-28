import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiLayers,
  FiFileText,
  FiTrendingUp,
  FiClock,
  FiBookOpen,
  FiDollarSign,
  FiCheckCircle
} from 'react-icons/fi';
import ProjectOverview from './ProjectOverview';
import DashboardAnalyticsCharts from './DashboardAnalyticsCharts';
import api from 'utils/api';
import ThemeLoader from 'components/Loader/ThemeLoader';

const DashDefault = () => {
  const [data, setData] = useState();
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  const userData = JSON.parse(localStorage.getItem('users')) || {};
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    }
  }, []);

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '0';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString('en-IN');
  };

  const formatAmount = (value) => {
    if (value === null || value === undefined || value === '') return '₹0';
    const n = Number(value);
    if (Number.isNaN(n)) return `₹${value}`;
    const hasDecimals = Math.abs(n - Math.trunc(n)) > 0;
    const formatted = hasDecimals
      ? n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : n.toLocaleString('en-IN');
    return `₹${formatted}`;
  };

  const clampPercent = (v) => {
    const n = Number(v) || 0;
    return Math.min(100, Math.max(0, Math.abs(n)));
  };

  // ─── Midnight Trust Color Palette ───
  const colors = {
    primary: '#C9A84C',
    primaryDark: '#B8963A',
    primarySoft: 'rgba(201, 168, 76, 0.15)',
    primaryBorder: 'rgba(201, 168, 76, 0.25)',
    primaryGlow: 'rgba(201, 168, 76, 0.30)',
    accent: '#E8C56A',
    accentSoft: 'rgba(232, 197, 106, 0.10)',
    accentBorder: 'rgba(232, 197, 106, 0.15)',
    success: '#2ECC71',
    successSoft: 'rgba(46, 204, 113, 0.12)',
    danger: '#E74C3C',
    dangerSoft: 'rgba(231, 76, 60, 0.10)',
    teal: '#2ECC71',
    amber: '#E8C56A',
    coral: '#E74C3C',
    blue: '#2ECC71',
    purple: '#E8C56A',
    green: '#2ECC71',
    orange: '#E8C56A',
  };

  const DashboardData = async () => {
    if (userData?.user_token) {
      try {
        const res = await api.get(`/dashboard/data`, {
          headers: { Authorization: `${userData?.user_token}` }
        });
        if (userData?.role_id === 4) {
          setData(res.data.data || {});
        } else {
          setData(res.data || {});
        }
      } catch (error) {
        console.error('DashboardData api error:', error);
        setData({});
      }
    }
  };

  const fetchProjectTotals = async () => {
    if (!userData?.user_token) return;
    try {
      const params = {};
      if (userData?.user_id) params.user_id = userData.user_id;
      const res = await api.get(`/dashboard/projectData`, {
        headers: { Authorization: userData.user_token },
        params,
      });
      const projects = res.data?.data || [];
      const totalReceivedAmount = projects
        .filter(item => Number(item.project_id) !== 38)
        .reduce((sum, item) => sum + Number(item.total_received_amount || 0), 0);
      const totalPendingAmount = projects
        .filter(item => Number(item.project_id) !== 38)
        .reduce((sum, item) => sum + Number(item.pending_amount || 0), 0);
      setTotalReceived(totalReceivedAmount);
      setTotalPending(totalPendingAmount);
    } catch (error) {
      console.error('Project API error:', error);
    }
  };

  const fetchOverdueCount = async () => {
    if (!userData?.user_token) return;
    try {
      const res = await api.get(`/booking/list?user_id=${userData?.user_id}`, {
        headers: { Authorization: userData.user_token }
      });
      const allBookings = res.data?.data || [];
      const projectMap = {};
      allBookings.forEach((booking) => {
        const key = `${booking.project_name}_${booking.plot_no}`;
        if (!projectMap[key]) {
          projectMap[key] = booking;
        } else {
          const existingDate = new Date(projectMap[key].create_at);
          const currentDate = new Date(booking.create_at);
          if (currentDate < existingDate) {
            projectMap[key] = booking;
          } else if (currentDate.getTime() === existingDate.getTime()) {
            if (booking.booking_id < projectMap[key].booking_id) {
              projectMap[key] = booking;
            }
          }
        }
      });
      const uniqueBookings = Object.values(projectMap);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let count = 0;
      uniqueBookings.forEach((row) => {
        const dateString = row.agreement_date || row.booking_date;
        if (!dateString) return;
        const dueDate = new Date(dateString);
        dueDate.setDate(dueDate.getDate() + 45);
        if (dueDate < today && Number(row.pending_amount) > 0) {
          count++;
        }
      });
      setOverdueCount(count);
    } catch (error) {
      console.error('Error fetching overdue count:', error);
    }
  };

  const dashSalesAdminData = data
    ? [
      {
        title: 'Total Projects',
        subtitle: 'All Projects',
        amount: formatNumber(data.totalProjects),
        icon: <FiLayers size={16} style={{ color: colors.primary }} />,
        barColor: colors.primary,
        value: Number(data.totalProjects) || 0,
        navigateTo: '/projects'
      },
      {
        title: 'Total Bookings',
        subtitle: 'All Bookings',
        amount: formatNumber(data.totalBookings),
        icon: <FiFileText size={16} style={{ color: colors.teal }} />,
        barColor: colors.teal,
        value: Number(data.totalBookings) || 0,
        navigateTo: '/bookings'
      },
      {
        title: 'Total Received',
        subtitle: 'All Receive',
        amount: formatAmount(data?.total_received_amount_dedup != null ? data.total_received_amount_dedup : totalReceived),
        icon: <FiTrendingUp size={16} style={{ color: colors.success }} />,
        barColor: colors.success,
        value: (data?.total_received_amount_dedup != null ? data.total_received_amount_dedup : totalReceived) || 0,
        navigateTo: '/receiveamount'
      },
      {
        title: 'Total Pending',
        subtitle: 'All Pending',
        amount: formatAmount(data?.total_pending_amount != null ? data.total_pending_amount : totalPending),
        icon: <FiClock size={16} style={{ color: colors.amber }} />,
        barColor: colors.amber,
        value: (data?.total_pending_amount != null ? data.total_pending_amount : totalPending) || 0,
        navigateTo: '/pendingamount'
      },
      {
        title: 'Pre Bookings',
        subtitle: 'Enquiries',
        amount: formatNumber(data.total_pre_booking),
        icon: <FiBookOpen size={16} style={{ color: colors.accent }} />,
        barColor: colors.accent,
        value: Number(data.total_pre_booking) || 0,
        navigateTo: '/prebooking'
      },
      {
        title: 'Today Received',
        subtitle: "Today's Amt",
        amount: formatAmount(data.today_received_amount),
        icon: <FiDollarSign size={16} style={{ color: colors.green }} />,
        barColor: colors.green,
        value: Number(data.today_received_amount) || 0,
        navigateTo: '/dashboard/projects/details?project_id=null&filter=today_received'
      },
      {
        title: 'Today Booked',
        subtitle: "Today's Book",
        amount: formatNumber(data.today_booked_count),
        icon: <FiCheckCircle size={16} style={{ color: colors.primary }} />,
        barColor: colors.primary,
        value: Number(data.today_booked_count) || 0,
        navigateTo: '/dashboard/projects/details?project_id=null&filter=today'
      },
      {
        title: 'Over Due Bookings',
        subtitle: 'Over Due',
        amount: formatNumber(overdueCount || 0),
        icon: <FiClock size={16} style={{ color: colors.danger }} />,
        barColor: colors.danger,
        value: Number(overdueCount) || 0,
        navigateTo: { pathname: '/bookings', state: { showOnlyDue: true } }
      }
    ]
    : [];

  const dashSalesDataEntry = [];

  const dashboardAccountedData = data
    ? [
      {
        title: 'Total Received',
        subtitle: 'All Receive',
        amount: formatAmount(data?.total_received_amount_dedup != null ? data.total_received_amount_dedup : totalReceived),
        icon: <FiTrendingUp size={16} style={{ color: colors.success }} />,
        barColor: colors.success,
        value: (data?.total_received_amount_dedup != null ? data.total_received_amount_dedup : totalReceived) || 0,
        navigateTo: '/receiveamount'
      },
      {
        title: 'Total Pending',
        subtitle: 'All Pending',
        amount: formatAmount(data?.total_pending_amount != null ? data.total_pending_amount : totalPending),
        icon: <FiClock size={16} style={{ color: colors.amber }} />,
        barColor: colors.amber,
        value: (data?.total_pending_amount != null ? data.total_pending_amount : totalPending) || 0,
        navigateTo: '/pendingamount'
      },
      {
        title: 'Today Received',
        subtitle: "Today's Amt",
        amount: formatAmount(data.today_received_amount),
        icon: <FiDollarSign size={16} style={{ color: colors.green }} />,
        barColor: colors.green,
        value: Number(data.today_received_amount) || 0,
        navigateTo: '/dashboard/projects/details?project_id=null&filter=today_received'
      },
      {
        title: 'Today Booked',
        subtitle: "Today's Book",
        amount: formatNumber(data.today_booked_count),
        icon: <FiCheckCircle size={16} style={{ color: colors.primary }} />,
        barColor: colors.primary,
        value: Number(data.today_booked_count) || 0,
        navigateTo: '/dashboard/projects/details?project_id=null&filter=today'
      },
      {
        title: 'Over Due Bookings',
        subtitle: 'Over Due',
        amount: formatNumber(overdueCount || 0),
        icon: <FiClock size={16} style={{ color: colors.danger }} />,
        barColor: colors.danger,
        value: Number(overdueCount) || 0,
        navigateTo: { pathname: '/bookings', state: { showOnlyDue: true } }
      }
    ]
    : [];

  const DashSaleData =
    userData?.role_id === 1
      ? dashSalesAdminData
      : userData?.role_id === 2
        ? dashSalesAdminData
        : userData?.role_id === 3
          ? dashboardAccountedData
          : dashSalesDataEntry;

  useEffect(() => {
    DashboardData();
    fetchProjectTotals();
    fetchOverdueCount();

    // Safety fallback: ensure dashboard reveals within 3.5s even if an API stalls
    const fallbackTimer = setTimeout(() => {
      setChartsLoaded(true);
      setProjectsLoaded(true);
    }, 3500);

    return () => clearTimeout(fallbackTimer);
  }, []);

  const handleCardClick = (item) => {
    if (item.navigateTo) {
      if (typeof item.navigateTo === 'object') {
        navigate(item.navigateTo.pathname, { state: item.navigateTo.state });
      } else {
        navigate(item.navigateTo);
      }
    }
  };

  const isPageLoading = !data || !chartsLoaded || !projectsLoaded;

  return (
    <React.Fragment>
      {isPageLoading && <ThemeLoader />}

      <div style={{ display: isPageLoading ? 'none' : 'block' }}>
        {/* 🌑 Dashboard Header - Midnight Trust */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2D45 50%, #1E3A5F 100%)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(201, 168, 76, 0.08)',
        }}
        className="dashboard-header-block"
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #C9A84C, #E8C56A, #C9A84C)',
            backgroundSize: '200% 100%',
            animation: 'shimmerBar 4s ease-in-out infinite'
          }}
        />

        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '800',
              color: '#F4F4F4',
              margin: 0,
              letterSpacing: '-0.025em'
            }}
          >
            📊 Overview Dashboard
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(244, 244, 244, 0.55)',
              margin: '4px 0 0',
              fontWeight: '400'
            }}
          >
            Monitor your real estate projects, metrics, and financials.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>


          {/* Date Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(201, 168, 76, 0.12)',
              border: '1px solid rgba(201, 168, 76, 0.20)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#E8C56A',
            }}
          >
            <span style={{ fontSize: '14px' }}>📅</span>
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* 📊 7 Stat Cards - CLEAR TEXT (No Overlap) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}
        className="dashboard-stats-grid"
      >
        {DashSaleData.map((item, index) => {
          const iconBg = `${item.barColor}22`;

          return (
            <div
              key={index}
              onClick={() => handleCardClick(item)}
              className="dash-stat-card"
              style={{
                cursor: 'pointer',
                background: '#1E3A5F',
                border: '1px solid rgba(201, 168, 76, 0.08)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: '135px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.borderColor = item.barColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.08)';
              }}
            >
              {/* Top accent bar */}
              <div
                style={{
                  height: '3px',
                  background: `linear-gradient(90deg, ${item.barColor}, ${item.barColor}88)`,
                  width: '100%',
                  flexShrink: 0,
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                }}
              />

              <div style={{ 
                padding: '12px 14px 14px', 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                {/* Icon + Badge Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: iconBg,
                      flexShrink: 0,
                      border: `1px solid ${item.barColor}33`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontSize: '8px',
                      fontWeight: '600',
                      color: item.barColor,
                      background: `${item.barColor}15`,
                      padding: '3px 8px',
                      borderRadius: '10px',
                      border: `1px solid ${item.barColor}30`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.subtitle}
                  </div>
                </div>

                {/* Title + Amount */}
                <div style={{ marginBottom: '6px' }}>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: '500',
                      color: 'rgba(244, 244, 244, 0.55)',
                      marginBottom: '3px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#F4F4F4',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.amount}
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: '3px',
                    background: 'rgba(244, 244, 244, 0.06)',
                    borderRadius: '99px',
                    overflow: 'hidden',
                    marginTop: 'auto',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${clampPercent(item.value)}%`,
                      background: `linear-gradient(90deg, ${item.barColor}, ${item.barColor}88)`,
                      borderRadius: '99px',
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Styles - ONLY RESPONSIVE */}
      <style>{`
        /* ── Responsive ── */
        @media (max-width: 1400px) {
          .dashboard-stats-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }

        @media (max-width: 992px) {
          .dashboard-stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 768px) {
          .dashboard-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .dashboard-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }

        @keyframes shimmerBar {
          0%   { background-position: 0% 0%; }
          50%  { background-position: 100% 0%; }
          100% { background-position: 0% 0%; }
        }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #0D1B2A;
        }
        ::-webkit-scrollbar-thumb {
          background: #C9A84C;
          border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #E8C56A;
        }
      `}</style>

        <ProjectOverview onLoaded={() => setProjectsLoaded(true)} />
        <div style={{ marginTop: '28px' }}>
          <DashboardAnalyticsCharts 
            onLoaded={() => setChartsLoaded(true)} 
            projectFinancials={{ 
              totalReceived: data?.total_received_amount_dedup != null ? data.total_received_amount_dedup : totalReceived, 
              totalPending: data?.total_pending_amount != null ? data.total_pending_amount : totalPending,
              todayReceived: data?.today_received_amount != null ? data.today_received_amount : 0,
              todayBooked: data?.today_booked_count != null ? data.today_booked_count : 0
            }}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default DashDefault;