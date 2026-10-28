import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Form, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Chart } from 'react-google-charts';
import {
  FiPieChart, FiBarChart2, FiTrendingUp, FiCreditCard, FiFilter,
  FiAward, FiAlertCircle, FiArrowRight,
  FiCalendar, FiClock, FiCheckCircle, FiFileText, FiLayers, FiBriefcase, FiActivity
} from 'react-icons/fi';
import api from 'utils/api';

const DashboardAnalyticsCharts = ({ onLoaded, projectFinancials }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('all');
  const [timePeriod, setTimePeriod] = useState('all'); // 'all' or '30d'
  const [plotViewMode, setPlotViewMode] = useState('all4'); // 'all4', 'sold', or 'detailed'
  const [comparisonMode, setComparisonMode] = useState('all4'); // 'all4', 'sold', or 'detailed'
  const [duesTab, setDuesTab] = useState('all'); // 'all', 'overdue', or 'upcoming'
  const [graphData, setGraphData] = useState(null);
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined'
      ? document.body.classList.contains('dark-theme') || localStorage.getItem('theme') === 'dark'
      : false
  );

  const userData = JSON.parse(localStorage.getItem('users')) || {};

  // ─── Theme Observer for dynamic dark/light toggle ───
  useEffect(() => {
    const updateTheme = () => {
      const active =
        document.body.classList.contains('dark-theme') ||
        localStorage.getItem('theme') === 'dark';
      setIsDark(active);
    };

    updateTheme();

    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('storage', updateTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', updateTheme);
    };
  }, []);

  const fetchGraphData = async (projectId = 'all') => {
    setLoading(true);
    try {
      const param = projectId !== 'all' ? `?project_id=${projectId}` : '';
      const res = await api.get(`/dashboard/graph-data${param}`, {
        headers: { Authorization: userData?.user_token || '' }
      });
      if (res.data?.success) {
        setGraphData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard graph data:', err);
    } finally {
      setLoading(false);
      if (typeof onLoaded === 'function') {
        onLoaded();
      }
    }
  };

  useEffect(() => {
    fetchGraphData(selectedProject);
  }, [selectedProject]);

  const formatAmount = (val) => {
    const num = Number(val) || 0;
    const hasDecimals = Math.abs(num - Math.trunc(num)) > 0;
    const formatted = hasDecimals
      ? num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : num.toLocaleString('en-IN');
    return '₹' + formatted;
  };

  // ─── Theme-Dependent Chart Colors ───
  const chartTextColor = isDark ? '#E2E8F0' : '#1E293B';
  const chartSubtextColor = isDark ? '#94A3B8' : '#64748B';
  const chartGridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0';

  // ─── 1. Donut Chart: Plots Distribution (All 4 Statuses Mode by default) ───
  const totalPlots = Number(graphData?.plot_distribution?.total_plots || 0);
  const bookedPlots = Number(graphData?.plot_distribution?.booked_plots || 0);
  const completedPlots = Number(graphData?.plot_distribution?.completed_plots || 0);
  const soldPlots = Number(graphData?.plot_distribution?.sold_plots || 0);
  const availablePlots = Number(graphData?.plot_distribution?.available_plots || 0);

  const bookedPct = totalPlots > 0 ? ((bookedPlots / totalPlots) * 100).toFixed(1) : '0';
  const completedPct = totalPlots > 0 ? ((completedPlots / totalPlots) * 100).toFixed(1) : '0';
  const soldPct = totalPlots > 0 ? ((soldPlots / totalPlots) * 100).toFixed(1) : String(graphData?.plot_distribution?.sold_percentage || '0');
  const availablePct = totalPlots > 0 ? ((availablePlots / totalPlots) * 100).toFixed(1) : '0';

  const plotsDonutData = plotViewMode === 'sold'
    ? [
      ['Status', 'Count'],
      [`Sold (${soldPct}%)`, { v: soldPlots, f: `${soldPlots} Sold (${soldPct}%)` }],
      [`Available (${availablePct}%)`, { v: availablePlots, f: `${availablePlots} Available (${availablePct}%)` }]
    ]
    : [
      ['Status', 'Count'],
      [`Booked (${bookedPct}%)`, { v: bookedPlots, f: `${bookedPlots} Booked (${bookedPct}%)` }],
      [`Completed (${completedPct}%)`, { v: completedPlots, f: `${completedPlots} Completed (${completedPct}%)` }],
      [`Available (${availablePct}%)`, { v: availablePlots, f: `${availablePlots} Available (${availablePct}%)` }]
    ];

  const plotsDonutOptions = {
    pieHole: 0.60,
    pieSliceText: 'none',
    colors: plotViewMode === 'sold'
      ? ['#8B5CF6', '#3B82F6'] // Purple for Sold, Blue for Available
      : ['#F59E0B', '#10B981', '#3B82F6'], // Amber for Booked, Emerald for Completed, Blue for Available
    legend: { position: 'none' },
    chartArea: { width: '86%', height: '86%' },
    backgroundColor: 'transparent',
    pieSliceBorderColor: isDark ? '#0D1B2A' : '#FFFFFF',
    tooltip: { textStyle: { fontSize: 13 } }
  };

  // ─── 2. Donut Chart: Financial Received vs Pending ───
  const isAllProjects = selectedProject === 'all';
  const finReceived = (isAllProjects && projectFinancials?.totalReceived != null && Number(projectFinancials.totalReceived) > 0)
    ? Number(projectFinancials.totalReceived)
    : Number(graphData?.financial_summary?.received_amount || 0);

  const finPending = (isAllProjects && projectFinancials?.totalPending != null && Number(projectFinancials.totalPending) > 0)
    ? Math.round(Number(projectFinancials.totalPending))
    : Math.round(Number(graphData?.financial_summary?.pending_amount || 0));

  const todayReceived = (isAllProjects && projectFinancials?.todayReceived != null)
    ? Number(projectFinancials.todayReceived)
    : Number(graphData?.financial_summary?.today_received || 0);

  const todayBooked = (isAllProjects && projectFinancials?.todayBooked != null)
    ? Number(projectFinancials.todayBooked)
    : Number(graphData?.financial_summary?.today_booked || 0);

  const finTotal = finReceived + finPending;
  const recoveryPct = finTotal > 0 ? Number(((finReceived / finTotal) * 100).toFixed(1)) : Number(graphData?.financial_summary?.recovery_percentage || 0);
  const pendingPct = recoveryPct > 0 ? Number((100 - recoveryPct).toFixed(1)) : 0;

  const pastReceived = Math.max(0, finReceived - todayReceived);
  const pastPct = finTotal > 0 ? Number(((pastReceived / finTotal) * 100).toFixed(1)) : 0;
  const todayPct = finTotal > 0 ? Number(((todayReceived / finTotal) * 100).toFixed(2)) : 0;

  const financeDonutData = [
    ['Amount Type', 'Amount (INR)']
  ];

  if (todayReceived > 0) {
    financeDonutData.push([
      `Earlier Received (${pastPct}%)`,
      {
        v: pastReceived,
        f: `Earlier Received: ${formatAmount(pastReceived)} (${pastPct}%)`
      }
    ]);
    financeDonutData.push([
      `Today Received (${todayPct}%)`,
      {
        v: todayReceived,
        f: `Today Received: ${formatAmount(todayReceived)} (${todayPct}%)`
      }
    ]);
  } else {
    financeDonutData.push([
      `Received (${recoveryPct}%)`,
      {
        v: finReceived,
        f: `Total Received: ${formatAmount(finReceived)} (${recoveryPct}%)`
      }
    ]);
  }

  financeDonutData.push([
    `Pending (${pendingPct}%)`,
    {
      v: finPending,
      f: `Total Pending: ${formatAmount(finPending)} (${pendingPct}%)`
    }
  ]);

  const financeDonutOptions = {
    pieHole: 0.60,
    pieSliceText: 'none',
    colors: todayReceived > 0 ? ['#10B981', '#2563EB', '#F59E0B'] : ['#10B981', '#F59E0B'],
    legend: { position: 'none' },
    chartArea: { width: '86%', height: '86%' },
    backgroundColor: 'transparent',
    pieSliceBorderColor: isDark ? '#0D1B2A' : '#FFFFFF',
    tooltip: { textStyle: { fontSize: 12 } }
  };

  // ─── 3. Column Chart: Project Comparison or Sector Breakdown ───
  const isSingleProject = selectedProject !== 'all';
  let comparisonData = [];

  if (comparisonMode === 'all4') {
    comparisonData = [['Category', 'Booked', 'Completed', 'Sold', 'Available']];
    if (isSingleProject && graphData?.sector_stats?.length > 0) {
      graphData.sector_stats.forEach((s) => {
        comparisonData.push([
          `Sector ${s.sector_name}`,
          s.booked || 0,
          s.completed || 0,
          s.sold || 0,
          s.available || 0
        ]);
      });
    } else if (graphData?.project_comparison?.length > 0) {
      graphData.project_comparison.forEach((p) => {
        comparisonData.push([
          p.project_name.slice(0, 15),
          p.booked_plots || 0,
          p.completed_plots || 0,
          p.sold_plots || 0,
          p.available_plots || 0
        ]);
      });
    } else {
      comparisonData.push(['No Data', 0, 0, 0, 0]);
    }
  } else if (comparisonMode === 'sold') {
    comparisonData = [['Category', 'Sold Plots', 'Available Plots']];
    if (isSingleProject && graphData?.sector_stats?.length > 0) {
      graphData.sector_stats.forEach((s) => {
        comparisonData.push([`Sector ${s.sector_name}`, s.sold || 0, s.available || 0]);
      });
    } else if (graphData?.project_comparison?.length > 0) {
      graphData.project_comparison.forEach((p) => {
        comparisonData.push([
          p.project_name.slice(0, 15),
          p.sold_plots || 0,
          p.available_plots || 0
        ]);
      });
    } else {
      comparisonData.push(['No Data', 0, 0]);
    }
  } else {
    // detailed 3-way stacked
    comparisonData = [['Category', 'Completed', 'Booked', 'Available']];
    if (isSingleProject && graphData?.sector_stats?.length > 0) {
      graphData.sector_stats.forEach((s) => {
        comparisonData.push([`Sector ${s.sector_name}`, s.completed || 0, s.booked || 0, s.available || 0]);
      });
    } else if (graphData?.project_comparison?.length > 0) {
      graphData.project_comparison.forEach((p) => {
        comparisonData.push([
          p.project_name.slice(0, 15),
          p.completed_plots || 0,
          p.booked_plots || 0,
          p.available_plots || 0
        ]);
      });
    } else {
      comparisonData.push(['No Data', 0, 0, 0]);
    }
  }

  const comparisonOptions = {
    isStacked: comparisonMode === 'all4' ? false : true,
    colors: comparisonMode === 'all4'
      ? ['#F59E0B', '#10B981', '#8B5CF6', '#3B82F6'] // Booked (Amber), Completed (Emerald), Sold (Purple), Available (Blue)
      : comparisonMode === 'sold'
        ? ['#8B5CF6', '#3B82F6'] // Sold (Purple), Available (Blue)
        : ['#10B981', '#F59E0B', '#3B82F6'], // Completed, Booked, Available
    legend: { position: 'top', textStyle: { color: chartTextColor, fontSize: 11, bold: true } },
    chartArea: { width: '88%', height: '70%' },
    backgroundColor: 'transparent',
    hAxis: { textStyle: { color: chartSubtextColor, fontSize: 11 } },
    vAxis: { minValue: 0, textStyle: { color: chartSubtextColor, fontSize: 11 }, gridlines: { color: chartGridColor } }
  };

  // ─── 4. Monthly Trend ComboChart (Dual-Axis: Bookings on Left, Collections on Right) ───
  let trendData = [['Month', 'Bookings (Plots)', 'Collections (Received)']];
  if (graphData?.monthly_trend?.length > 0) {
    graphData.monthly_trend.forEach((m) => {
      const bCount = Number(m.bookings || 0);
      const cAmt = Number(m.collections || 0);
      trendData.push([
        m.month,
        { v: bCount, f: `${bCount} Plots` },
        { v: Math.round(cAmt / 1000), f: formatAmount(cAmt) }
      ]);
    });
  } else {
    trendData.push(['Current', { v: 0, f: '0 Plots' }, { v: 0, f: '₹0' }]);
  }

  const trendOptions = {
    seriesType: 'bars',
    series: {
      0: { targetAxisIndex: 0, color: '#3B82F6' }, // Bookings Count (Blue Bars on Left Axis)
      1: { type: 'line', targetAxisIndex: 1, color: '#10B981', curveType: 'function', pointSize: 6 } // Collections (Green Line on Right Axis)
    },
    vAxes: {
      0: {
        title: 'Bookings (Plots)',
        minValue: 0,
        textStyle: { color: chartSubtextColor, fontSize: 11 },
        titleTextStyle: { color: '#3B82F6', fontSize: 11, bold: true },
        gridlines: { color: chartGridColor }
      },
      1: {
        title: 'Collections (₹ Thousands)',
        minValue: 0,
        textStyle: { color: chartSubtextColor, fontSize: 11 },
        titleTextStyle: { color: '#10B981', fontSize: 11, bold: true },
        gridlines: { color: 'transparent' }
      }
    },
    legend: { position: 'top', textStyle: { color: chartTextColor, fontSize: 11, bold: true } },
    chartArea: { width: '88%', height: '68%' },
    backgroundColor: 'transparent',
    hAxis: { textStyle: { color: chartSubtextColor, fontSize: 11 } },
    tooltip: { textStyle: { fontSize: 12 } }
  };

  // ─── 5. Payment Modes Donut ───
  let paymentModeData = [['Payment Mode', 'Receipts Count']];
  let totalReceiptsCount = 0;
  if (graphData?.payment_modes?.length > 0) {
    graphData.payment_modes.forEach((pm) => {
      totalReceiptsCount += Number(pm.count || 0);
    });
    if (totalReceiptsCount > 0) {
      graphData.payment_modes.forEach((pm) => {
        const c = Number(pm.count || 0);
        if (c > 0) {
          const pct = ((c / totalReceiptsCount) * 100).toFixed(1);
          paymentModeData.push([
            `${pm.mode || 'Cash'} (${pct}%)`,
            { v: c, f: `${pm.mode || 'Cash'}: ${c} Receipts (${pct}%) - ${formatAmount(pm.total_amount)}` }
          ]);
        }
      });
    } else {
      paymentModeData.push(['No Receipts', { v: 1, f: '0 Receipts (₹0)' }]);
    }
  } else {
    paymentModeData.push(['No Receipts', { v: 1, f: '0 Receipts (₹0)' }]);
  }

  const paymentModeOptions = {
    pieHole: 0.60,
    pieSliceText: 'none',
    colors: totalReceiptsCount > 0 
      ? ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4']
      : [isDark ? '#334155' : '#E2E8F0'],
    legend: { position: 'none' },
    chartArea: { width: '86%', height: '86%' },
    backgroundColor: 'transparent',
    pieSliceBorderColor: isDark ? '#0D1B2A' : '#FFFFFF',
    tooltip: { textStyle: { fontSize: 12 } }
  };

  // ── 4 Standard Payment Modes to ensure Card 3 always has a full balanced 2x2 grid ──
  const standardPaymentModes = [
    { key: 'cheque', label: 'Cheque', dotColor: '#2563EB', boxClass: 'box-available', pillClass: 'pill-blue' },
    { key: 'online', label: 'Online / RTGS', dotColor: '#7C3AED', boxClass: 'box-sold', pillClass: 'pill-purple' },
    { key: 'upi', label: 'UPI', dotColor: '#059669', boxClass: 'box-completed', pillClass: 'pill-emerald' },
    { key: 'cash', label: 'Cash', dotColor: '#D97706', boxClass: 'box-booked', pillClass: 'pill-amber' }
  ];

  const paymentCardItems = standardPaymentModes.map((spm) => {
    const found = graphData?.payment_modes?.find((pm) => {
      const m = (pm.mode || '').toLowerCase();
      if (spm.key === 'cheque') return m.includes('cheque') || m.includes('check');
      if (spm.key === 'online') return m.includes('rtgs') || m.includes('neft') || m.includes('online') || m.includes('imps');
      if (spm.key === 'upi') return m.includes('upi');
      if (spm.key === 'cash') return m.includes('cash');
      return false;
    });

    const count = Number(found?.count || 0);
    const amount = Number(found?.total_amount || 0);
    const pct = totalReceiptsCount > 0 && count > 0 ? ((count / totalReceiptsCount) * 100).toFixed(1) : '0.0';

    return {
      ...spm,
      count,
      total_amount: amount,
      pct
    };
  });

  const handlePaymentCardClick = (pm) => {
    const projParam = selectedProject && selectedProject !== 'all' ? `project_id=${selectedProject}&` : '';
    navigate(`/dashboard/projects/details?${projParam}filter=${pm.key}`);
  };

  const handlePlotBoxClick = (filterType) => {
    const projParam = selectedProject && selectedProject !== 'all' ? `project_id=${selectedProject}&` : '';
    navigate(`/dashboard/projects/details?${projParam}filter=${filterType}`);
  };

  const handleFinanceBoxClick = (type) => {
    const projParam = selectedProject && selectedProject !== 'all' ? `project_id=${selectedProject}&` : 'project_id=null&';
    if (type === 'received') {
      navigate('/receiveamount');
    } else if (type === 'pending') {
      navigate('/pendingamount');
    } else if (type === 'today_received') {
      navigate(`/dashboard/projects/details?${projParam}filter=today_received`);
    }
  };

  // ─── 6. Plot Size Distribution (Demand by Sq.Ft Slab) ───
  let sizeChartData = [['Size Slab', 'Sold', 'Available']];
  if (graphData?.size_distribution?.length > 0) {
    graphData.size_distribution.forEach((sz) => {
      sizeChartData.push([
        sz.size_slab,
        Number(sz.sold_plots || 0),
        Number(sz.available_plots || 0)
      ]);
    });
  } else {
    sizeChartData.push(['No Data', 0, 0]);
  }

  const sizeChartOptions = {
    isStacked: true,
    colors: ['#8B5CF6', '#3B82F6'], // Sold (Purple), Available (Blue)
    legend: { position: 'top', textStyle: { color: chartTextColor, fontSize: 11, bold: true } },
    chartArea: { width: '85%', height: '70%' },
    backgroundColor: 'transparent',
    hAxis: { textStyle: { color: chartSubtextColor, fontSize: 11 } },
    vAxis: { minValue: 0, textStyle: { color: chartSubtextColor, fontSize: 11 }, gridlines: { color: chartGridColor } },
    tooltip: { textStyle: { fontSize: 12 } }
  };

  // ─── 7. 30-Day Daily Activity ComboChart (Bookings & Amount Received) ───
  let dailyVelocityData = [['Date', 'Booked Plots', 'Received Amount']];
  if (graphData?.last_30_days_metrics?.daily_trend?.length > 0) {
    graphData.last_30_days_metrics.daily_trend.forEach((d) => {
      const bookedCount = Number(d.bookings || 0);
      const bookedAmt = Number(d.booked_amount || 0);
      const collectionsAmt = Number(d.collections || 0);

      const bookedLabel = bookedCount > 0
        ? (bookedAmt > 0 ? `${bookedCount} Plots (Deal: ${formatAmount(bookedAmt)})` : `${bookedCount} Plots`)
        : '0 Plots';

      dailyVelocityData.push([
        d.date,
        { v: bookedCount, f: bookedLabel },
        { v: Math.round(collectionsAmt / 1000), f: formatAmount(collectionsAmt) }
      ]);
    });
  } else {
    dailyVelocityData.push(['Today', { v: 0, f: '0 Plots' }, { v: 0, f: '₹0' }]);
  }

  const dailyVelocityOptions = {
    seriesType: 'bars',
    series: {
      0: { targetAxisIndex: 0, color: '#F59E0B' }, // Booked Plots (Amber Bars)
      1: { type: 'line', targetAxisIndex: 1, color: '#10B981', curveType: 'function', pointSize: 5 } // Received ₹ Line (Green)
    },
    vAxes: {
      0: {
        title: 'Booked Plots',
        minValue: 0,
        textStyle: { color: chartSubtextColor, fontSize: 11 },
        titleTextStyle: { color: '#F59E0B', fontSize: 11, bold: true },
        gridlines: { color: chartGridColor }
      },
      1: {
        title: 'Received (₹ Thousands)',
        minValue: 0,
        textStyle: { color: chartSubtextColor, fontSize: 11 },
        titleTextStyle: { color: '#10B981', fontSize: 11, bold: true },
        gridlines: { color: 'transparent' }
      }
    },
    hAxis: { textStyle: { color: chartSubtextColor, fontSize: 10 }, showTextEvery: 2 },
    legend: { position: 'top', textStyle: { color: chartTextColor, fontSize: 11, bold: true } },
    chartArea: { width: '88%', height: '68%' },
    backgroundColor: 'transparent',
    tooltip: { textStyle: { fontSize: 12 } }
  };

  // ─── 8. Separate Overdue and Upcoming Dues for 15-Day Alert ───
  const allDuesList = graphData?.last_30_days_metrics?.upcoming_dues || [];
  const overdueDuesList = allDuesList.filter(u => {
    const dueDate = u.due_date ? new Date(u.due_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return u.is_overdue || (dueDate && dueDate < today);
  });
  const upcomingDuesList = allDuesList.filter(u => {
    const dueDate = u.due_date ? new Date(u.due_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !u.is_overdue && (!dueDate || dueDate >= today);
  });
  const overdueTotalAmt = overdueDuesList.reduce((s, u) => s + (Number(u.pending_amount) || 0), 0);
  const upcomingTotalAmt = upcomingDuesList.reduce((s, u) => s + (Number(u.pending_amount) || 0), 0);

  // ─── 9. Bank-wise Collections Share Donut ───
  let bankShareData = [['Bank Name', 'Amount (INR)']];
  let totalBankAmount = 0;
  if (graphData?.bank_shares?.length > 0) {
    graphData.bank_shares.forEach(b => {
      totalBankAmount += Number(b.total_amount || 0);
    });
    graphData.bank_shares.forEach(b => {
      const amt = Number(b.total_amount || 0);
      const pct = totalBankAmount > 0 ? ((amt / totalBankAmount) * 100).toFixed(1) : '0';
      bankShareData.push([
        `${b.bank_name} (${pct}%)`,
        { v: amt, f: `${b.bank_name}: ${formatAmount(amt)} (${pct}%) • ${b.count} Receipts` }
      ]);
    });
  } else {
    bankShareData.push(['No Bank Data', { v: 1, f: '₹0' }]);
  }

  const bankShareOptions = {
    pieHole: 0.58,
    pieSliceText: 'percentage',
    pieSliceTextStyle: { fontSize: 11, bold: true },
    colors: ['#059669', '#2563EB', '#7C3AED', '#D97706', '#EC4899', '#0891B2', '#64748B'],
    legend: {
      position: 'right',
      textStyle: { color: chartTextColor, fontSize: 11 },
      alignment: 'center'
    },
    chartArea: { width: '92%', height: '82%' },
    backgroundColor: 'transparent',
    pieSliceBorderColor: isDark ? '#0D1B2A' : '#FFFFFF',
    tooltip: { textStyle: { fontSize: 12 } }
  };

  // ─── 10. Project Average Rate Column Chart ───
  let projectRateData = [['Project', 'Average Rate (₹ / Sq.Ft)', { role: 'style' }]];
  if (graphData?.project_rates?.length > 0) {
    const ratePalette = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#EC4899', '#0891B2'];
    graphData.project_rates.forEach((pr, idx) => {
      const color = ratePalette[idx % ratePalette.length];
      projectRateData.push([
        pr.project_name ? pr.project_name.slice(0, 16) : `Proj ${idx + 1}`,
        { v: pr.avg_rate, f: `₹${Number(pr.avg_rate || 0).toLocaleString('en-IN')} / sq.ft (${pr.total_plots} Plots)` },
        color
      ]);
    });
  } else {
    projectRateData.push(['No Data', { v: 0, f: '₹0' }, '#2563EB']);
  }

  const projectRateOptions = {
    legend: { position: 'none' },
    chartArea: { width: '85%', height: '70%' },
    backgroundColor: 'transparent',
    hAxis: {
      textStyle: { color: chartSubtextColor, fontSize: 11 },
      slantedText: true,
      slantedTextAngle: 25
    },
    vAxis: {
      title: 'Rate (₹/Sq.Ft)',
      minValue: 0,
      textStyle: { color: chartSubtextColor, fontSize: 11 },
      titleTextStyle: { color: chartSubtextColor, fontSize: 11 },
      gridlines: { color: chartGridColor }
    },
    tooltip: { textStyle: { fontSize: 12 } }
  };

  // ─── 11. Quarterly Trend (Past Quarters) ───
  const formatQuarterLabel = (qStr) => {
    if (!qStr) return '';
    const match = String(qStr).trim().match(/(\d{2,4})\s*Q(\d)/i);
    if (match) {
      let yr = match[1];
      if (yr.length === 2) yr = '20' + yr;
      const qNum = match[2];
      const qNames = {
        '1': 'Jan - Mar (Q1)',
        '2': 'Apr - Jun (Q2)',
        '3': 'Jul - Sep (Q3)',
        '4': 'Oct - Dec (Q4)'
      };
      return `${qNames[qNum] || `Q${qNum}`} ${yr}`;
    }
    return qStr;
  };

  let quarterlyData = [['Quarter', 'Booked Plots', 'Collections (₹ Lakh)']];
  if (graphData?.quarterly_trend?.length > 0) {
    graphData.quarterly_trend.forEach(q => {
      const collInLakh = Number(((Number(q.collections || 0)) / 100000).toFixed(1));
      quarterlyData.push([
        formatQuarterLabel(q.quarter),
        { v: Number(q.bookings || 0), f: `${q.bookings} Plots Booked` },
        { v: collInLakh, f: `₹${collInLakh.toLocaleString('en-IN')} Lakh Received` }
      ]);
    });
  } else {
    quarterlyData.push(['No Data', { v: 0, f: '0' }, { v: 0, f: '₹0' }]);
  }

  const quarterlyOptions = {
    seriesType: 'bars',
    series: {
      0: { targetAxisIndex: 0, color: '#F59E0B' },
      1: { type: 'line', targetAxisIndex: 1, color: '#10B981', curveType: 'function', pointSize: 6 }
    },
    vAxes: {
      0: {
        title: 'Booked Plots (Count)',
        minValue: 0,
        textStyle: { color: chartSubtextColor, fontSize: 11 },
        titleTextStyle: { color: '#F59E0B', fontSize: 11, bold: true },
        gridlines: { color: chartGridColor }
      },
      1: {
        title: 'Collections (₹ Lakh)',
        minValue: 0,
        textStyle: { color: chartSubtextColor, fontSize: 11 },
        titleTextStyle: { color: '#10B981', fontSize: 11, bold: true },
        gridlines: { color: 'transparent' }
      }
    },
    legend: { position: 'top', textStyle: { color: chartTextColor, fontSize: 11, bold: true } },
    chartArea: { width: '88%', height: '65%' },
    backgroundColor: 'transparent',
    hAxis: {
      textStyle: { color: chartSubtextColor, fontSize: 10, bold: true },
      slantedText: true,
      slantedTextAngle: 25
    },
    tooltip: { textStyle: { fontSize: 12 } }
  };

  return (
    <div className="dashboard-analytics-section mb-4">
      {/* ─── STYLES FOR DUAL MODE (LIGHT + DARK) ─── */}
      <style>{`
        /* ── Light Mode Base ── */
        .analytics-card {
          background: #FFFFFF !important;
          border: 1px solid #E2E8F0 !important;
          border-radius: 14px;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .analytics-header-card {
          background: #FFFFFF !important;
          border: 1px solid #E2E8F0 !important;
          border-radius: 14px;
        }

        .analytics-title {
          color: #0F172A !important;
          font-weight: 700;
        }

        .analytics-subtitle {
          color: #64748B !important;
        }

        .analytics-card-title {
          color: #1E293B !important;
          font-weight: 700;
        }

        .analytics-select {
          background-color: #F8FAFC !important;
          color: #0F172A !important;
          border: 1px solid #CBD5E1 !important;
          border-radius: 8px;
        }

        .analytics-badge-primary {
          background: #EFF6FF !important;
          color: #1D4ED8 !important;
          border: 1px solid #DBEAFE !important;
        }

        .analytics-badge-success {
          background: #ECFDF5 !important;
          color: #047857 !important;
          border: 1px solid #D1FAE5 !important;
        }

        .analytics-badge-warning {
          background: #FEF3C7 !important;
          color: #B45309 !important;
          border: 1px solid #FDE68A !important;
        }

        .analytics-badge-sold {
          background: #F3E8FF !important;
          color: #7E22CE !important;
          border: 1px solid #E9D5FF !important;
        }

        .analytics-badge-neutral {
          background: #F1F5F9 !important;
          color: #475569 !important;
          border: 1px solid #E2E8F0 !important;
        }

        .analytics-divider {
          border-top: 1px solid #E2E8F0 !important;
        }

        .analytics-stat-label {
          color: #64748B !important;
        }

        /* ── Dark Mode Overrides (body.dark-theme) ── */
        body.dark-theme .analytics-card,
        body.dark-theme .analytics-header-card {
          background: #0D1B2A !important;
          border: 1px solid rgba(201, 168, 76, 0.22) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
        }

        body.dark-theme .analytics-title,
        body.dark-theme .analytics-card-title {
          color: #F8FAFC !important;
        }

        body.dark-theme .analytics-subtitle {
          color: #94A3B8 !important;
        }

        body.dark-theme .analytics-select {
          background-color: #06111D !important;
          color: #F8FAFC !important;
          border: 1px solid rgba(201, 168, 76, 0.35) !important;
        }

        body.dark-theme .analytics-select option {
          background-color: #0D1B2A !important;
          color: #F8FAFC !important;
        }

        body.dark-theme .analytics-badge-primary {
          background: rgba(37, 99, 235, 0.2) !important;
          color: #93C5FD !important;
          border: 1px solid rgba(147, 197, 253, 0.3) !important;
        }

        body.dark-theme .analytics-badge-success {
          background: rgba(16, 185, 129, 0.2) !important;
          color: #6EE7B7 !important;
          border: 1px solid rgba(110, 231, 183, 0.3) !important;
        }

        body.dark-theme .analytics-badge-warning {
          background: rgba(245, 158, 11, 0.2) !important;
          color: #FCD34D !important;
          border: 1px solid rgba(245, 158, 11, 0.35) !important;
        }

        body.dark-theme .analytics-badge-sold {
          background: rgba(168, 85, 247, 0.2) !important;
          color: #D8B4FE !important;
          border: 1px solid rgba(168, 85, 247, 0.35) !important;
        }

        body.dark-theme .analytics-badge-neutral {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #CBD5E1 !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
        }

        body.dark-theme .analytics-divider {
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        body.dark-theme .analytics-stat-label {
          color: #94A3B8 !important;
        }

        /* ─── 2x2 Grid Stat Cards for Row 1 Donuts (No Overlap, Spacious) ─── */
        .stat-card-2x2 {
          height: 100%;
          border-radius: 9px;
          padding: 7px 9px !important;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card-2x2:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .stat-title-lbl {
          font-size: 11px;
          font-weight: 700;
          line-height: 1.2;
        }

        .stat-badge-pill {
          font-size: 10px;
          font-weight: 800;
          padding: 1.5px 6px;
          border-radius: 5px;
          line-height: 1.2;
          display: inline-block;
          white-space: nowrap;
        }

        .stat-main-val {
          font-size: 13.5px;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .stat-unit-lbl {
          font-size: 10px;
          font-weight: 600;
          opacity: 0.85;
        }

        /* Pill Badge Colors - Light Mode */
        .pill-amber { background: rgba(245, 158, 11, 0.16); color: #B45309; }
        .pill-emerald { background: rgba(16, 185, 129, 0.16); color: #047857; }
        .pill-purple { background: rgba(139, 92, 246, 0.16); color: #6D28D9; }
        .pill-blue { background: rgba(37, 99, 235, 0.16); color: #1D4ED8; }

        /* Pill Badge Colors - Dark Mode */
        body.dark-theme .pill-amber { background: rgba(245, 158, 11, 0.28); color: #FDE68A; }
        body.dark-theme .pill-emerald { background: rgba(16, 185, 129, 0.28); color: #A7F3D0; }
        body.dark-theme .pill-purple { background: rgba(139, 92, 246, 0.28); color: #DDD6FE; }
        body.dark-theme .pill-blue { background: rgba(37, 99, 235, 0.28); color: #BFDBFE; }

        /* ─── Mini Stat Boxes (Booked, Completed, Sold, Available, etc.) ─── */
        .mini-stat-box {
          height: 100% !important;
          min-height: 56px !important;
          border-radius: 9px !important;
          padding: 5px 3px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          box-sizing: border-box !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .mini-stat-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .mini-stat-val {
          font-size: 14px;
          font-weight: 800 !important;
          line-height: 1.15 !important;
          letter-spacing: -0.3px;
        }

        .mini-stat-lbl {
          font-size: 10px !important;
          font-weight: 700 !important;
          margin-top: 3px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 4px !important;
          white-space: nowrap !important;
          line-height: 1 !important;
        }

        /* Light Mode Mini Boxes */
        .box-booked {
          background: #FEF3C7 !important;
          border: 1px solid #FDE68A !important;
        }
        .box-booked .mini-stat-val { color: #D97706 !important; }
        .box-booked .mini-stat-lbl { color: #B45309 !important; }

        .box-completed {
          background: #ECFDF5 !important;
          border: 1px solid #D1FAE5 !important;
        }
        .box-completed .mini-stat-val { color: #059669 !important; }
        .box-completed .mini-stat-lbl { color: #047857 !important; }

        .box-sold {
          background: #F3E8FF !important;
          border: 1px solid #E9D5FF !important;
        }
        .box-sold .mini-stat-val { color: #7C3AED !important; }
        .box-sold .mini-stat-lbl { color: #6D28D9 !important; }

        .box-available {
          background: #EFF6FF !important;
          border: 1px solid #DBEAFE !important;
        }
        .box-available .mini-stat-val { color: #2563EB !important; }
        .box-available .mini-stat-lbl { color: #1D4ED8 !important; }

        /* Dark Mode Mini Boxes */
        body.dark-theme .box-booked {
          background: rgba(245, 158, 11, 0.12) !important;
          border: 1px solid rgba(245, 158, 11, 0.28) !important;
        }
        body.dark-theme .box-booked .mini-stat-val { color: #FBBF24 !important; }
        body.dark-theme .box-booked .mini-stat-lbl { color: #FDE68A !important; }

        body.dark-theme .box-completed {
          background: rgba(16, 185, 129, 0.12) !important;
          border: 1px solid rgba(16, 185, 129, 0.28) !important;
        }
        body.dark-theme .box-completed .mini-stat-val { color: #34D399 !important; }
        body.dark-theme .box-completed .mini-stat-lbl { color: #A7F3D0 !important; }

        body.dark-theme .box-sold {
          background: rgba(139, 92, 246, 0.14) !important;
          border: 1px solid rgba(139, 92, 246, 0.32) !important;
        }
        body.dark-theme .box-sold .mini-stat-val { color: #A78BFA !important; }
        body.dark-theme .box-sold .mini-stat-lbl { color: #DDD6FE !important; }

        body.dark-theme .box-available {
          background: rgba(59, 130, 246, 0.12) !important;
          border: 1px solid rgba(59, 130, 246, 0.28) !important;
        }
        body.dark-theme .box-available .mini-stat-val { color: #60A5FA !important; }
        body.dark-theme .box-available .mini-stat-lbl { color: #BFDBFE !important; }

        /* ── Header Controls Layout & Responsiveness ── */
        .analytics-header-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .analytics-time-pills {
          display: flex;
          align-items: center;
          padding: 3px;
          border-radius: 8px;
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          flex-shrink: 0;
        }

        body.dark-theme .analytics-time-pills {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .analytics-time-btn {
          font-size: 11.5px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #64748B;
          white-space: nowrap;
          transition: all 0.2s ease;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        body.dark-theme .analytics-time-btn {
          color: #94A3B8;
        }

        .analytics-time-btn.active {
          background: #3B82F6 !important;
          color: #FFFFFF !important;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.35);
        }

        .analytics-project-select-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 250px;
        }

        @media (max-width: 991px) {
          .analytics-project-select-wrap {
            min-width: 220px;
          }
        }

        @media (max-width: 768px) {
          .analytics-title {
            font-size: 14.5px !important;
          }
          .analytics-card-title {
            font-size: 13px !important;
          }
          .mini-stat-val {
            font-size: 13px !important;
          }
          .mini-stat-lbl {
            font-size: 9px !important;
          }
          .analytics-header-controls {
            width: 100%;
            justify-content: space-between;
          }
          .analytics-project-select-wrap {
            flex: 1;
            min-width: 180px;
          }
        }

        @media (max-width: 575px) {
          .analytics-header-controls {
            flex-direction: column;
            align-items: stretch !important;
            gap: 8px;
            width: 100% !important;
          }

          .analytics-time-pills {
            width: 100% !important;
            display: flex;
          }

          .analytics-time-btn {
            flex: 1;
            padding: 7px 4px;
            font-size: 11.5px;
            text-align: center;
          }

          .analytics-project-select-wrap {
            width: 100% !important;
            min-width: 100% !important;
          }

          .analytics-select {
            font-size: 12px !important;
            height: 38px !important;
            width: 100% !important;
          }
        }

        /* ─── Executive 30-Day KPI Cards ─── */
        .kpi-metric-card {
          position: relative !important;
          border-radius: 14px !important;
          overflow: hidden !important;
          transition: transform 0.22s ease, box-shadow 0.22s ease !important;
          border: 1px solid #E2E8F0 !important;
          background: #FFFFFF !important;
          cursor: pointer !important;
        }

        body.dark-theme .kpi-metric-card {
          background: #111827 !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        .kpi-metric-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.08) !important;
        }

        body.dark-theme .kpi-metric-card:hover {
          box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.35) !important;
        }

        .kpi-accent-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3.5px;
        }

        .kpi-icon-glow {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
        }

        .kpi-chip-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          line-height: 1.2;
          white-space: nowrap;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>

      {/* ── Header Bar With Project Selector (Mobile-Responsive) ── */}
      <Card className="analytics-header-card shadow-sm mb-3">
        <Card.Body className="p-2.5 p-md-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 gap-md-3">
            {/* Left: Icon + Title + Subtitle */}
            <div className="d-flex align-items-center gap-2">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  minWidth: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 3px 10px rgba(37, 99, 235, 0.35)',
                  flexShrink: 0
                }}
              >
                <FiBarChart2 size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h5 className="mb-0 analytics-title text-truncate" style={{ fontSize: '15px' }}>
                  Project Analytics & Charts
                </h5>
                <span className="analytics-subtitle text-truncate" style={{ fontSize: '11px', display: 'block', lineHeight: 1.3 }}>
                  Live Plot Status, Cash Flow & Financial Overview
                </span>
              </div>
            </div>

            {/* Right: Time Range Buttons + Project Dropdown (Responsive Controls) */}
            <div className="analytics-header-controls">
              {/* Time Period Filter Pill Buttons */}
              <div className="analytics-time-pills">
                <button
                  type="button"
                  className={`analytics-time-btn ${timePeriod === 'all' ? 'active' : ''}`}
                  onClick={() => setTimePeriod('all')}
                >
                  🌐 All Time
                </button>
                <button
                  type="button"
                  className={`analytics-time-btn ${timePeriod === '30d' ? 'active' : ''}`}
                  onClick={() => setTimePeriod('30d')}
                >
                  📅 Last 30 Days
                </button>
              </div>

              {/* Project Selector Dropdown */}
              <div className="analytics-project-select-wrap">
                <FiFilter size={15} className="text-muted flex-shrink-0 d-none d-sm-block" />
                <Form.Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="analytics-select w-100"
                  style={{
                    height: '36px',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '3px 28px 3px 10px'
                  }}
                >
                  <option value="all">🏢 All Projects</option>
                  {graphData?.projects_list?.map((p) => (
                    <option
                      key={p.project_id}
                      value={p.project_id}
                      className={p.krutiDev_font === 1 ? 'kruti-dev' : ''}
                    >
                      📍 {p.project_name}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 analytics-subtitle" style={{ fontSize: '13px' }}>
            Loading analytics & chart data...
          </p>
        </div>
      ) : timePeriod === '30d' ? (
        <>
          {/* ── 30-DAY EXECUTIVE PERFORMANCE ROW ── */}
          <Row className="g-2 g-sm-3 mb-3">
            {/* 1. 30 Days Bookings */}
            <Col xs={6} sm={6} lg={3}>
              <Card 
                className="kpi-metric-card h-100 shadow-sm p-3"
                onClick={() => handlePlotBoxClick('30d_bookings')}
                role="button"
                tabIndex={0}
                title="Click to view Last 30 Days Booked plots"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlotBoxClick('30d_bookings'); }}
              >
                <div className="kpi-accent-bar" style={{ background: 'linear-gradient(90deg, #2563EB, #60A5FA)' }}></div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="analytics-stat-label fw-bold text-truncate" style={{ fontSize: '12px' }}>
                    🆕 New Bookings
                  </span>
                  <div className="kpi-icon-glow" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)' }}>
                    <FiCheckCircle size={17} />
                  </div>
                </div>
                <div className="d-flex align-items-baseline gap-1 my-1">
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#2563EB', lineHeight: 1.1 }}>
                    {graphData?.last_30_days_metrics?.plots_booked || 0}
                  </span>
                  <span className="analytics-stat-label fw-bold" style={{ fontSize: '12px' }}>Plots</span>
                </div>
                <div className="mt-2">
                  <span
                    className="kpi-chip-badge"
                    style={{
                      background: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                      border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #DBEAFE',
                      color: isDark ? '#93C5FD' : '#1D4ED8'
                    }}
                    title={formatAmount(graphData?.last_30_days_metrics?.booked_value || 0)}
                  >
                    🔵 Deal: <strong>{formatAmount(graphData?.last_30_days_metrics?.booked_value || 0)}</strong>
                  </span>
                </div>
              </Card>
            </Col>

            {/* 2. 30 Days Collections */}
            <Col xs={6} sm={6} lg={3}>
              <Card 
                className="kpi-metric-card h-100 shadow-sm p-3"
                onClick={() => handlePlotBoxClick('30d_received')}
                role="button"
                tabIndex={0}
                title="Click to view Last 30 Days Received payments"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlotBoxClick('30d_received'); }}
              >
                <div className="kpi-accent-bar" style={{ background: 'linear-gradient(90deg, #059669, #34D399)' }}></div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="analytics-stat-label fw-bold text-truncate" style={{ fontSize: '12px' }}>
                    💰 Received Amount
                  </span>
                  <div className="kpi-icon-glow" style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)' }}>
                    <FiTrendingUp size={17} />
                  </div>
                </div>
                <div className="d-flex align-items-baseline gap-1 my-1">
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#059669', lineHeight: 1.1 }}>
                    {formatAmount(graphData?.last_30_days_metrics?.total_collected || 0)}
                  </span>
                </div>
                <div className="mt-2">
                  <span
                    className="kpi-chip-badge"
                    style={{
                      background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                      border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #D1FAE5',
                      color: isDark ? '#6EE7B7' : '#047857'
                    }}
                  >
                    🟢 Bank, Cheque & Online
                  </span>
                </div>
              </Card>
            </Col>

            {/* 3. 30 Days Registries */}
            <Col xs={6} sm={6} lg={3}>
              <Card 
                className="kpi-metric-card h-100 shadow-sm p-3"
                onClick={() => handlePlotBoxClick('30d_registries')}
                role="button"
                tabIndex={0}
                title="Click to view Last 30 Days Completed Registries"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlotBoxClick('30d_registries'); }}
              >
                <div className="kpi-accent-bar" style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }}></div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="analytics-stat-label fw-bold text-truncate" style={{ fontSize: '12px' }}>
                    📑 Registries
                  </span>
                  <div className="kpi-icon-glow" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)' }}>
                    <FiAward size={17} />
                  </div>
                </div>
                <div className="d-flex align-items-baseline gap-1 my-1">
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#7C3AED', lineHeight: 1.1 }}>
                    {graphData?.last_30_days_metrics?.registries_completed || 0}
                  </span>
                  <span className="analytics-stat-label fw-bold" style={{ fontSize: '12px' }}>Registered</span>
                </div>
                <div className="mt-2">
                  <span
                    className="kpi-chip-badge"
                    style={{
                      background: isDark ? 'rgba(139, 92, 246, 0.15)' : '#F5F3FF',
                      border: isDark ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid #EDE9FE',
                      color: isDark ? '#C4B5FD' : '#6D28D9'
                    }}
                  >
                    🟣 Completed Registry Docs
                  </span>
                </div>
              </Card>
            </Col>

            {/* 4. Upcoming Dues in Next 15 Days */}
            <Col xs={6} sm={6} lg={3}>
              <Card 
                className="kpi-metric-card h-100 shadow-sm p-3"
                onClick={() => handlePlotBoxClick('15d_dues')}
                role="button"
                tabIndex={0}
                title="Click to view 15-Day Dues Alert customer listing"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlotBoxClick('15d_dues'); }}
              >
                <div className="kpi-accent-bar" style={{ background: 'linear-gradient(90deg, #4F46E5, #818CF8)' }}></div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="analytics-stat-label fw-bold text-truncate" style={{ fontSize: '12px' }}>
                    ⏰ 15-Day Dues Alert
                  </span>
                  <div className="kpi-icon-glow" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)' }}>
                    <FiClock size={17} />
                  </div>
                </div>
                <div className="d-flex align-items-baseline gap-1 my-1">
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#4F46E5', lineHeight: 1.1 }}>
                    {allDuesList.length}
                  </span>
                  <span className="analytics-stat-label fw-bold" style={{ fontSize: '12px' }}>Customer Dues</span>
                </div>
                <div className="mt-2">
                  <span
                    className="kpi-chip-badge"
                    style={{
                      background: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF',
                      border: isDark ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid #C7D2FE',
                      color: isDark ? '#C7D2FE' : '#3730A3'
                    }}
                    title={formatAmount(overdueTotalAmt + upcomingTotalAmt || graphData?.last_30_days_metrics?.upcoming_total_amount || 0)}
                  >
                    <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#6366F1', marginRight: '6px' }} />
                    Total Due: <strong>{formatAmount(overdueTotalAmt + upcomingTotalAmt || graphData?.last_30_days_metrics?.upcoming_total_amount || 0)}</strong>
                  </span>
                </div>
              </Card>
            </Col>
          </Row>

          {/* ── 30-DAY DAILY VELOCITY & UPCOMING DUES ROW ── */}
          <Row className="g-3 mb-3">
            {/* Daily Velocity Line/Area Chart */}
            <Col lg={8} md={12}>
              <Card className="analytics-card h-100 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-3 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-1">
                  <div className="d-flex align-items-center gap-2">
                    <FiTrendingUp style={{ color: '#10B981' }} />
                    <span className="analytics-card-title" style={{ fontSize: '14px' }}>
                      30-Day Daily Velocity: Bookings & Collections
                    </span>
                  </div>
                  <span className="badge analytics-badge-primary" style={{ fontSize: '11px', padding: '5px 9px' }}>
                    Date-wise Live Report
                  </span>
                </Card.Header>
                <Card.Body className="p-2">
                  <Chart
                    chartType="ComboChart"
                    width="100%"
                    height="280px"
                    data={dailyVelocityData}
                    options={dailyVelocityOptions}
                  />
                  <div className="d-flex justify-content-around text-center pt-2 analytics-divider mt-1 flex-wrap gap-2" style={{ fontSize: '11.5px' }}>
                    <div>
                      <span className="text-warning fw-bold">🟡 Total Bookings: {graphData?.last_30_days_metrics?.plots_booked || 0} Plots</span>
                      <div className="analytics-stat-label">Booked Plots</div>
                    </div>
                    <div>
                      <span className="text-primary fw-bold">🔵 Deal Value: {formatAmount(graphData?.last_30_days_metrics?.booked_value || 0)}</span>
                      <div className="analytics-stat-label">Total Booking Deal Value</div>
                    </div>
                    <div>
                      <span className="text-success fw-bold">🟢 Received Amount: {formatAmount(graphData?.last_30_days_metrics?.total_collected || 0)}</span>
                      <div className="analytics-stat-label">Received Amount</div>
                    </div>
                  </div>


                </Card.Body>
              </Card>
            </Col>

            {/* Upcoming Dues (Next 15 Days Alert) */}
            <Col lg={4} md={12}>
              <Card className="analytics-card h-100 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-3 pb-2">
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
                    <div className="d-flex align-items-center gap-2">
                      <FiClock style={{ color: '#6366F1' }} />
                      <span className="analytics-card-title" style={{ fontSize: '13.5px' }}>
                        15-Day Dues Alert
                      </span>
                    </div>
                    <span className="badge analytics-badge-primary" style={{ fontSize: '10.5px', padding: '3px 7px', background: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE' }}>
                      Total: {allDuesList.length}
                    </span>
                  </div>

                  {/* 3 Separate Toggle Pills: All, Overdue, Upcoming */}
                  <div
                    className="d-flex align-items-center p-1 rounded gap-1"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setDuesTab('all')}
                      className="btn btn-sm flex-fill p-1"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '5px',
                        border: 'none',
                        background: duesTab === 'all' ? '#3B82F6' : 'transparent',
                        color: duesTab === 'all' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                        boxShadow: duesTab === 'all' ? '0 2px 6px rgba(59, 130, 246, 0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      All ({allDuesList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuesTab('overdue')}
                      className="btn btn-sm flex-fill p-1"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '5px',
                        border: 'none',
                        background: duesTab === 'overdue' ? '#EF4444' : 'transparent',
                        color: duesTab === 'overdue' ? '#FFFFFF' : (isDark ? '#FCA5A5' : '#DC2626'),
                        boxShadow: duesTab === 'overdue' ? '0 2px 6px rgba(239, 68, 68, 0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: duesTab === 'overdue' ? '#FFFFFF' : '#EF4444', marginRight: '5px', verticalAlign: 'middle' }} />
                      Overdue ({overdueDuesList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuesTab('upcoming')}
                      className="btn btn-sm flex-fill p-1"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '5px',
                        border: 'none',
                        background: duesTab === 'upcoming' ? 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)' : 'transparent',
                        color: duesTab === 'upcoming' ? '#FFFFFF' : (isDark ? '#C7D2FE' : '#4F46E5'),
                        boxShadow: duesTab === 'upcoming' ? '0 2px 6px rgba(79, 70, 229, 0.35)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: duesTab === 'upcoming' ? '#FFFFFF' : '#6366F1', marginRight: '5px', verticalAlign: 'middle' }} />
                      Upcoming ({upcomingDuesList.length})
                    </button>
                  </div>
                </Card.Header>

                <Card.Body className="p-3 pt-1">
                  <div className="d-flex flex-column gap-3" style={{ maxHeight: '430px', overflowY: 'auto' }}>
                    {/* 1. OVERDUE SECTION (Separate) */}
                    {(duesTab === 'all' || duesTab === 'overdue') && overdueDuesList.length > 0 && (
                      <div>
                        <div
                          className="d-flex align-items-center justify-content-between px-2 py-1 mb-2 rounded"
                          style={{
                            background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                            border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #FECACA'
                          }}
                        >
                          <span className="fw-bold text-danger d-flex align-items-center gap-1" style={{ fontSize: '11.5px' }}>
                            <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444' }} />
                            Overdue (Past Due Date • {overdueDuesList.length})
                          </span>
                          <span className="fw-bold text-danger" style={{ fontSize: '11.5px' }}>
                            {formatAmount(overdueTotalAmt)}
                          </span>
                        </div>
                        <div className="d-flex flex-column gap-2">
                          {overdueDuesList.map((u, idx) => (
                            <div
                              key={`ov-${idx}`}
                              className="d-flex align-items-center justify-content-between p-2 rounded"
                              style={{
                                background: isDark ? '#1E293B' : '#FFFFFF',
                                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                                borderLeft: '3.5px solid #EF4444',
                                boxShadow: isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.04)'
                              }}
                            >
                              <div>
                                <div
                                  className={`fw-bold ${u.krutiDev_font === 1 ? 'kruti-dev' : ''}`}
                                  style={{ fontSize: '12.5px', color: chartTextColor }}
                                >
                                  {u.customer_name}
                                </div>
                                <div style={{ fontSize: '10.5px', color: chartSubtextColor }}>
                                  Plot #{u.plot_no} • {u.project_name}
                                </div>
                                {u.mobile_no && u.mobile_no !== '—' && u.mobile_no !== '0' && (
                                  <div style={{ fontSize: '11px', marginTop: '2px' }}>
                                    <a
                                      href={`tel:${String(u.mobile_no).split(',')[0].trim()}`}
                                      style={{ textDecoration: 'none', color: '#2563EB', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                      title={`Call: ${u.mobile_no}`}
                                    >
                                      📞 {u.mobile_no}
                                    </a>
                                  </div>
                                )}
                              </div>
                              <div className="text-end">
                                <div className="fw-bold text-danger" style={{ fontSize: '12.5px' }}>
                                  {formatAmount(u.pending_amount)}
                                </div>
                                <span
                                  className="fw-bold"
                                  style={{
                                    fontSize: '10px',
                                    color: '#DC2626',
                                    background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
                                    border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #FECACA',
                                    padding: '2px 7px',
                                    borderRadius: '4px',
                                    display: 'inline-block',
                                    marginTop: '2px'
                                  }}
                                >
                                  Overdue: {u.due_date ? new Date(u.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. UPCOMING SECTION (Separate) */}
                    {(duesTab === 'all' || duesTab === 'upcoming') && upcomingDuesList.length > 0 && (
                      <div>
                        <div
                          className="d-flex align-items-center justify-content-between px-2 py-1 mb-2 rounded"
                          style={{
                            background: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF',
                            border: isDark ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid #C7D2FE'
                          }}
                        >
                          <span
                            className="fw-bold d-flex align-items-center gap-1"
                            style={{
                              fontSize: '11.5px',
                              color: isDark ? '#C7D2FE' : '#3730A3'
                            }}
                          >
                            <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#6366F1' }} />
                            Upcoming Dues (Next 15 Days • {upcomingDuesList.length})
                          </span>
                          <span
                            className="fw-bold"
                            style={{
                              fontSize: '11.5px',
                              color: isDark ? '#A5B4FC' : '#4338CA'
                            }}
                          >
                            {formatAmount(upcomingTotalAmt)}
                          </span>
                        </div>
                        <div className="d-flex flex-column gap-2">
                          {upcomingDuesList.map((u, idx) => (
                            <div
                              key={`up-${idx}`}
                              className="d-flex align-items-center justify-content-between p-2 rounded"
                              style={{
                                background: isDark ? '#1E293B' : '#FFFFFF',
                                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                                borderLeft: '3.5px solid #6366F1',
                                boxShadow: isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.04)'
                              }}
                            >
                              <div>
                                <div
                                  className={`fw-bold ${u.krutiDev_font === 1 ? 'kruti-dev' : ''}`}
                                  style={{ fontSize: '12.5px', color: chartTextColor }}
                                >
                                  {u.customer_name}
                                </div>
                                <div style={{ fontSize: '10.5px', color: chartSubtextColor }}>
                                  Plot #{u.plot_no} • {u.project_name}
                                </div>
                                {u.mobile_no && u.mobile_no !== '—' && u.mobile_no !== '0' && (
                                  <div style={{ fontSize: '11px', marginTop: '2px' }}>
                                    <a
                                      href={`tel:${String(u.mobile_no).split(',')[0].trim()}`}
                                      style={{ textDecoration: 'none', color: '#2563EB', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                      title={`Call: ${u.mobile_no}`}
                                    >
                                      📞 {u.mobile_no}
                                    </a>
                                  </div>
                                )}
                              </div>
                              <div className="text-end">
                                <div
                                  className="fw-bold"
                                  style={{
                                    fontSize: '12.5px',
                                    color: isDark ? '#A5B4FC' : '#3730A3'
                                  }}
                                >
                                  {formatAmount(u.pending_amount)}
                                </div>
                                <span
                                  style={{
                                    fontSize: '10px',
                                    color: isDark ? '#C7D2FE' : '#4338CA',
                                    fontWeight: 700,
                                    background: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF',
                                    border: isDark ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid #C7D2FE',
                                    padding: '2px 7px',
                                    borderRadius: '4px',
                                    display: 'inline-block',
                                    marginTop: '2px'
                                  }}
                                >
                                  Due: {u.due_date ? new Date(u.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* EMPTY STATES */}
                    {allDuesList.length === 0 && (
                      <div className="text-center py-5 text-muted" style={{ fontSize: '12px' }}>
                        No due installments found in past or next 15 days
                      </div>
                    )}
                    {allDuesList.length > 0 && duesTab === 'overdue' && overdueDuesList.length === 0 && (
                      <div className="text-center py-4 text-muted" style={{ fontSize: '12px' }}>
                        No overdue installments in past 15 days 👍
                      </div>
                    )}
                    {allDuesList.length > 0 && duesTab === 'upcoming' && upcomingDuesList.length === 0 && (
                      <div className="text-center py-4 text-muted" style={{ fontSize: '12px' }}>
                        No upcoming installments in next 15 days
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <>
          {/* ── ROW 1: Donut Charts (Plots, Received vs Pending, Payment Modes) ── */}
          <Row className="g-3 mb-3">
            {/* Donut 1: Plot Status (Completed, Booked, Sold, Available) */}
            <Col lg={4} md={6}>
              <Card className="analytics-card h-100 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-3 pb-2 d-flex flex-column justify-content-between gap-1" style={{ minHeight: '66px' }}>
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <div className="d-flex align-items-center gap-2">
                      <FiPieChart style={{ color: '#8B5CF6', flexShrink: 0 }} />
                      <span className="analytics-card-title" style={{ fontSize: '13.5px' }}>
                        Plot Status ({plotViewMode === 'sold' ? 'Sold vs Avail' : '4 Status'})
                      </span>
                    </div>
                  </div>
                  {/* View Mode Toggle: 4 Status vs Sold */}
                  <div className="d-flex align-items-center justify-content-between w-100 pt-1">
                    <div className="d-flex align-items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPlotViewMode('all4')}
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                          transition: 'all 0.2s ease',
                          background: plotViewMode === 'all4' ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'),
                          color: plotViewMode === 'all4' ? '#ffffff' : (isDark ? '#CBD5E1' : '#475569')
                        }}
                      >
                        4 Status
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlotViewMode('sold')}
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                          transition: 'all 0.2s ease',
                          background: plotViewMode === 'sold' ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'),
                          color: plotViewMode === 'sold' ? '#ffffff' : (isDark ? '#CBD5E1' : '#475569')
                        }}
                      >
                        Sold vs Avail
                      </button>
                    </div>
                    <span className="badge analytics-badge-primary" style={{ fontSize: '11px', padding: '4px 7px' }}>
                      Total: {graphData?.plot_distribution?.total_plots || 0}
                    </span>
                  </div>
                </Card.Header>
                <Card.Body className="p-2 d-flex flex-column justify-content-between">
                  <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                    <Chart
                      chartType="PieChart"
                      width="100%"
                      height="200px"
                      data={plotsDonutData}
                      options={plotsDonutOptions}
                    />
                    {/* Centered Donut Metric */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        pointerEvents: 'none',
                        lineHeight: 1.2
                      }}
                    >
                      {plotViewMode === 'sold' ? (
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <div>
                            <div style={{ fontSize: '17px', fontWeight: 800, color: '#8B5CF6', lineHeight: 1.1 }}>
                              {soldPct}%
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: isDark ? '#D8B4FE' : '#6D28D9', marginTop: '2px' }}>
                              Sold ({soldPlots})
                            </div>
                          </div>
                          <div style={{ width: '1px', height: '24px', background: isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1' }}></div>
                          <div>
                            <div style={{ fontSize: '17px', fontWeight: 800, color: '#3B82F6', lineHeight: 1.1 }}>
                              {availablePct}%
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: isDark ? '#93C5FD' : '#1D4ED8', marginTop: '2px' }}>
                              Avail ({availablePlots})
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#D8B4FE' : '#7C3AED' }}>
                            {soldPlots}
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#C4B5FD' : '#6D28D9' }}>
                            Sold ({soldPct}%)
                          </div>
                          <div style={{ fontSize: '9.5px', color: chartSubtextColor, marginTop: '1px' }}>
                            Total {totalPlots} Plots
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2x2 Grid: Booked, Completed, Sold, Available (Spacious, No Overlap) */}
                  <Row className="g-2 pt-2 analytics-divider mt-1 align-items-stretch">
                    {/* 1. Booked */}
                    <Col xs={6} onClick={() => handlePlotBoxClick('booked')} role="button" title="Click to view Booked Plots" className="d-flex flex-column" style={{ cursor: 'pointer' }}>
                      <div className="stat-card-2x2 box-booked">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <div className="d-flex align-items-center gap-1">
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D97706', display: 'inline-block' }}></span>
                            <span className="stat-title-lbl">Booked</span>
                          </div>
                          <span className="stat-badge-pill pill-amber">{bookedPct}%</span>
                        </div>
                        <div className="stat-main-val">
                          {bookedPlots} <span className="stat-unit-lbl">Plots</span>
                        </div>
                      </div>
                    </Col>

                    {/* 2. Completed */}
                    <Col xs={6} onClick={() => handlePlotBoxClick('completed')} role="button" title="Click to view Completed Plots" className="d-flex flex-column" style={{ cursor: 'pointer' }}>
                      <div className="stat-card-2x2 box-completed">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <div className="d-flex align-items-center gap-1">
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669', display: 'inline-block' }}></span>
                            <span className="stat-title-lbl">Completed</span>
                          </div>
                          <span className="stat-badge-pill pill-emerald">{completedPct}%</span>
                        </div>
                        <div className="stat-main-val">
                          {completedPlots} <span className="stat-unit-lbl">Plots</span>
                        </div>
                      </div>
                    </Col>

                    {/* 3. Sold */}
                    <Col xs={6} onClick={() => handlePlotBoxClick('sold')} role="button" title="Click to view Sold Plots" className="d-flex flex-column" style={{ cursor: 'pointer' }}>
                      <div className="stat-card-2x2 box-sold">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <div className="d-flex align-items-center gap-1">
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7C3AED', display: 'inline-block' }}></span>
                            <span className="stat-title-lbl">Sold</span>
                          </div>
                          <span className="stat-badge-pill pill-purple">{soldPct}%</span>
                        </div>
                        <div className="stat-main-val">
                          {soldPlots} <span className="stat-unit-lbl">Plots</span>
                        </div>
                      </div>
                    </Col>

                    {/* 4. Available */}
                    <Col xs={6} onClick={() => handlePlotBoxClick('available')} role="button" title="Click to view Available Plots" className="d-flex flex-column" style={{ cursor: 'pointer' }}>
                      <div className="stat-card-2x2 box-available">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <div className="d-flex align-items-center gap-1">
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563EB', display: 'inline-block' }}></span>
                            <span className="stat-title-lbl">Available</span>
                          </div>
                          <span className="stat-badge-pill pill-blue">{availablePct}%</span>
                        </div>
                        <div className="stat-main-val">
                          {availablePlots} <span className="stat-unit-lbl">Plots</span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Donut 2: Financial Received vs Pending */}
            <Col lg={4} md={6}>
              <Card className="analytics-card h-100 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-3 pb-2 d-flex flex-column justify-content-between gap-1" style={{ minHeight: '66px' }}>
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <div className="d-flex align-items-center gap-2">
                      <FiTrendingUp style={{ color: '#10B981', flexShrink: 0 }} />
                      <span className="analytics-card-title" style={{ fontSize: '13.5px' }}>
                        Received vs Pending
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between w-100 pt-1">
                    <span
                      onClick={() => handleFinanceBoxClick('today_received')}
                      role="button"
                      title="Click to view Today's Received details"
                      className="badge"
                      style={{
                        background: 'rgba(37, 99, 235, 0.12)',
                        color: '#2563EB',
                        fontSize: '11px',
                        padding: '4px 8px',
                        fontWeight: 700,
                        border: '1px solid rgba(37, 99, 235, 0.25)',
                        cursor: 'pointer'
                      }}
                    >
                      ⚡ Today: {formatAmount(todayReceived)}
                    </span>
                    <div className="d-flex align-items-center gap-1">
                      <span
                        onClick={() => handleFinanceBoxClick('received')}
                        role="button"
                        title="Click to view Received Amount details"
                        className="badge analytics-badge-success"
                        style={{ fontSize: '10.5px', padding: '4px 6px', cursor: 'pointer' }}
                      >
                        {recoveryPct}% Received
                      </span>
                      <span
                        onClick={() => handleFinanceBoxClick('pending')}
                        role="button"
                        title="Click to view Pending Amount details"
                        className="badge analytics-badge-warning"
                        style={{ fontSize: '10.5px', padding: '4px 6px', cursor: 'pointer' }}
                      >
                        {pendingPct}% Pending
                      </span>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="p-2 d-flex flex-column justify-content-between">
                  <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                    <Chart
                      chartType="PieChart"
                      width="100%"
                      height="200px"
                      data={financeDonutData}
                      options={financeDonutOptions}
                    />
                    {/* Centered Donut Metric (Clear, Clean, No Number Cut-Off) */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        pointerEvents: 'none',
                        lineHeight: 1.15
                      }}
                    >
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#10B981', lineHeight: 1.1 }}>
                        {recoveryPct}%
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#A7F3D0' : '#059669', marginTop: '2px' }}>
                        Received
                      </div>
                      <div style={{ fontSize: '10px', color: '#2563EB', fontWeight: 700, marginTop: '2px' }}>
                        Today: {formatAmount(todayReceived)}
                      </div>
                    </div>
                  </div>

                  {/* 2-Row Stacked Layout: Row 1 = Total Received (Left) + Today Received (Right), Row 2 = Pending */}
                  <Row className="g-2 pt-2 analytics-divider mt-1 align-items-stretch">
                    {/* 1. Received (Left Col) */}
                    <Col
                      xs={6}
                      onClick={() => handleFinanceBoxClick('received')}
                      role="button"
                      title="Click to view Received Amount (Total Received)"
                      className="d-flex flex-column"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="stat-card-2x2 box-completed p-2" style={{ minHeight: '52px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <div className="d-flex align-items-center gap-1 text-truncate">
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669', display: 'inline-block', flexShrink: 0 }}></span>
                            <span className="stat-title-lbl text-truncate" style={{ fontSize: '11px' }}>Received</span>
                          </div>
                          <span className="stat-badge-pill pill-emerald" style={{ fontSize: '10px', padding: '1px 6px' }}>{recoveryPct}%</span>
                        </div>
                        <div className="stat-main-val text-truncate" style={{ fontSize: '13.5px', fontWeight: 800 }} title={formatAmount(finReceived)}>
                          {formatAmount(finReceived)}
                        </div>
                        <span style={{ fontSize: '9.5px', color: chartSubtextColor }}>Total Received</span>
                      </div>
                    </Col>

                    {/* 2. Today Received (Right Col) */}
                    <Col
                      xs={6}
                      onClick={() => handleFinanceBoxClick('today_received')}
                      role="button"
                      title="Click to view Today's Received details"
                      className="d-flex flex-column"
                      style={{ cursor: 'pointer' }}
                    >
                      <div
                        className="stat-card-2x2 p-2"
                        style={{
                          minHeight: '52px',
                          background: isDark ? 'rgba(37, 99, 235, 0.12)' : '#EFF6FF',
                          border: isDark ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid #BFDBFE',
                          borderRadius: '10px'
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <div className="d-flex align-items-center gap-1 text-truncate">
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563EB', display: 'inline-block', flexShrink: 0 }}></span>
                            <span className="stat-title-lbl text-truncate" style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700 }}>Today</span>
                          </div>
                          <span className="badge" style={{ background: '#2563EB', color: '#fff', fontSize: '9.5px', padding: '2px 5px' }}>Today</span>
                        </div>
                        <div className="stat-main-val text-truncate" style={{ fontSize: '13.5px', fontWeight: 800, color: isDark ? '#60A5FA' : '#1D4ED8' }} title={formatAmount(todayReceived)}>
                          {formatAmount(todayReceived)}
                        </div>
                        <span style={{ fontSize: '9.5px', color: chartSubtextColor }}>Today's Collection</span>
                      </div>
                    </Col>

                    {/* 3. Pending (Full Width Row 2) */}
                    <Col
                      xs={12}
                      onClick={() => handleFinanceBoxClick('pending')}
                      role="button"
                      title="Click to view Pending Amount (Pending Balance)"
                      className="d-flex flex-column"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="stat-card-2x2 box-booked p-2" style={{ minHeight: '50px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D97706', display: 'inline-block' }}></span>
                            <span className="stat-title-lbl" style={{ fontSize: '11.5px' }}>Total Pending</span>
                          </div>
                          <span className="stat-badge-pill pill-amber" style={{ fontSize: '10.5px', padding: '1px 6px' }}>{pendingPct}%</span>
                        </div>
                        <div className="d-flex align-items-baseline justify-content-between">
                          <div className="stat-main-val" style={{ fontSize: '14px', fontWeight: 800 }} title={formatAmount(finPending)}>
                            {formatAmount(finPending)}
                          </div>
                          <span style={{ fontSize: '10.5px', color: chartSubtextColor, fontWeight: 500 }}>Pending Balance</span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Donut 3: Payment Mode Share */}
            <Col lg={4} md={12}>
              <Card className="analytics-card h-100 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-3 pb-2 d-flex flex-column justify-content-between gap-1" style={{ minHeight: '66px' }}>
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <div className="d-flex align-items-center gap-2">
                      <FiCreditCard style={{ color: '#8B5CF6', flexShrink: 0 }} />
                      <span className="analytics-card-title" style={{ fontSize: '13.5px' }}>
                        Payment Modes
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between w-100 pt-1">
                    <span className="badge analytics-badge-neutral" style={{ fontSize: '11px', padding: '4px 8px' }}>
                      Transaction Share
                    </span>
                    <span 
                      className="badge analytics-badge-primary" 
                      style={{ fontSize: '11px', padding: '4px 7px', cursor: 'pointer' }}
                      role="button"
                      onClick={() => navigate('/receiveamount' + (selectedProject && selectedProject !== 'all' ? `?project_id=${selectedProject}` : ''))}
                      title="Click to view all Receipts"
                    >
                      Total: {totalReceiptsCount} Receipts
                    </span>
                  </div>
                </Card.Header>
                <Card.Body className="p-2 d-flex flex-column justify-content-between">
                  <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                    <Chart
                      chartType="PieChart"
                      width="100%"
                      height="200px"
                      data={paymentModeData}
                      options={paymentModeOptions}
                    />
                    {/* Centered Donut Metric */}
                    <div
                      role="button"
                      onClick={() => navigate('/receiveamount' + (selectedProject && selectedProject !== 'all' ? `?project_id=${selectedProject}` : ''))}
                      title="Click to view all Receipts"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        lineHeight: 1.15
                      }}
                    >
                      <div style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#60A5FA' : '#2563EB', lineHeight: 1.1 }}>
                        {totalReceiptsCount}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#93C5FD' : '#1D4ED8', marginTop: '2px' }}>
                        Total Receipts
                      </div>
                      <div style={{ fontSize: '9.5px', color: chartSubtextColor, marginTop: '1px' }}>
                        Payment Share
                      </div>
                    </div>
                  </div>

                  {/* 2x2 Grid for Payment Modes (All 4 boxes always balanced, aligned & clickable) */}
                  <Row className="g-2 pt-2 analytics-divider mt-1 align-items-stretch">
                    {paymentCardItems.map((pm, i) => (
                      <Col 
                        xs={6} 
                        key={i} 
                        className="d-flex flex-column"
                        onClick={() => handlePaymentCardClick(pm)}
                        role="button"
                        style={{ cursor: 'pointer' }}
                        title={`Click to view ${pm.label} receipts in Receive Amount`}
                      >
                        <div 
                          className={`stat-card-2x2 ${pm.boxClass}`}
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            userSelect: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = isDark 
                              ? '0 6px 16px rgba(0, 0, 0, 0.45)' 
                              : '0 6px 16px rgba(0, 0, 0, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <div className="d-flex align-items-center gap-1" style={{ minWidth: 0 }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: pm.dotColor, display: 'inline-block', flexShrink: 0 }}></span>
                              <span className="stat-title-lbl text-truncate">{pm.label}</span>
                            </div>
                            <span className={`stat-badge-pill ${pm.pillClass}`}>{pm.pct}%</span>
                          </div>
                          <div className="d-flex align-items-baseline justify-content-between">
                            <span className="stat-main-val" style={{ fontSize: '12.5px' }} title={formatAmount(pm.total_amount)}>
                              {formatAmount(pm.total_amount)}
                            </span>
                            <span className="stat-unit-lbl" style={{ fontSize: '9.5px', opacity: 0.85 }}>
                              {pm.count} Receipts
                            </span>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ── ROW 2: Column Comparison & Monthly Trend ── */}
          <Row className="g-3">
            {/* Bar/Column Chart: Comparison */}
            <Col lg={6}>
              <Card className="analytics-card h-100 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-3 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-1">
                  <div className="d-flex align-items-center gap-2">
                    <FiBarChart2 style={{ color: comparisonMode === 'sold' ? '#8B5CF6' : '#EF4444' }} />
                    <span className="analytics-card-title" style={{ fontSize: '14px' }}>
                      {isSingleProject ? 'Sector/Block Comparison (Plots)' : 'Project Comparison (Plots)'}
                    </span>
                  </div>
                  {/* View Mode Toggle: 4 Status vs Sold vs Detailed */}
                  <div className="d-flex align-items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setComparisonMode('all4')}
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        transition: 'all 0.2s ease',
                        background: comparisonMode === 'all4' ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'),
                        color: comparisonMode === 'all4' ? '#ffffff' : (isDark ? '#CBD5E1' : '#475569')
                      }}
                    >
                      4 Status (All)
                    </button>
                    <button
                      type="button"
                      onClick={() => setComparisonMode('sold')}
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        transition: 'all 0.2s ease',
                        background: comparisonMode === 'sold' ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'),
                        color: comparisonMode === 'sold' ? '#ffffff' : (isDark ? '#CBD5E1' : '#475569')
                      }}
                    >
                      Sold vs Available
                    </button>
                    <button
                      type="button"
                      onClick={() => setComparisonMode('detailed')}
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        transition: 'all 0.2s ease',
                        background: comparisonMode === 'detailed' ? '#2563EB' : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'),
                        color: comparisonMode === 'detailed' ? '#ffffff' : (isDark ? '#CBD5E1' : '#475569')
                      }}
                    >
                      Stacked (3-Way)
                    </button>
                  </div>
                </Card.Header>
                <Card.Body className="p-2">
                  <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="290px"
                    data={comparisonData}
                    options={comparisonOptions}
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* Line/Area Chart: Monthly Trend */}
            <Col lg={6}>
              <Card className="analytics-card h-100 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <FiTrendingUp style={{ color: '#2563EB' }} />
                    <span className="analytics-card-title" style={{ fontSize: '14px' }}>
                      Monthly Trend (Past 6 Months)
                    </span>
                  </div>
                  <span className="badge analytics-badge-primary" style={{ fontSize: '11px', padding: '5px 9px' }}>
                    Bookings & Collection
                  </span>
                </Card.Header>
                <Card.Body className="p-2">
                  <Chart
                    chartType="ComboChart"
                    width="100%"
                    height="290px"
                    data={trendData}
                    options={trendOptions}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ── ROW 3: Plot Size Demand & Top Pending Recovery in One Single Row ── */}
          <Row className="g-3 mt-1 align-items-stretch">
            {/* 1. Plot Size Demand Breakdown */}
            <Col lg={6}>
              <Card className="analytics-card h-100 shadow-sm d-flex flex-column">
                <Card.Header className="bg-transparent border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <FiPieChart style={{ color: '#8B5CF6' }} />
                    <span className="analytics-card-title" style={{ fontSize: '14px' }}>
                      Plot Size Demand (Sq.Ft)
                    </span>
                  </div>
                  <span className="badge analytics-badge-primary" style={{ fontSize: '11px', padding: '5px 9px' }}>
                    Sold vs Available
                  </span>
                </Card.Header>
                <Card.Body className="p-2 flex-grow-1 d-flex flex-column justify-content-center">
                  <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="290px"
                    data={sizeChartData}
                    options={sizeChartOptions}
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* 2. Top Pending Recovery */}
            <Col lg={6}>
              <Card className="analytics-card h-100 shadow-sm d-flex flex-column">
                <Card.Header className="bg-transparent border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <FiAlertCircle style={{ color: '#EF4444' }} />
                    <span className="analytics-card-title" style={{ fontSize: '14px' }}>
                      Top Pending Dues
                    </span>
                  </div>
                  <span className="badge analytics-badge-warning" style={{ fontSize: '11px', padding: '4px 7px' }}>
                    Recovery Alert
                  </span>
                </Card.Header>
                <Card.Body className="p-3 flex-grow-1" style={{ maxHeight: '315px', overflowY: 'auto' }}>
                  {graphData?.top_pending_customers?.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {graphData.top_pending_customers.map((c, idx) => (
                        <div
                          key={idx}
                          className="d-flex align-items-center justify-content-between p-2 rounded"
                          style={{
                            background: isDark ? 'rgba(239, 68, 68, 0.08)' : '#FEF2F2',
                            border: isDark ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #FEE2E2'
                          }}
                        >
                          <div>
                            <div
                              className={`fw-bold ${c.krutiDev_font === 1 ? 'kruti-dev' : ''}`}
                              style={{ fontSize: '12.5px', color: chartTextColor }}
                            >
                              {c.customer_name}
                            </div>
                            <div style={{ fontSize: '10.5px', color: chartSubtextColor }}>
                              Plot #{c.plot_no} • {c.project_name}
                            </div>
                            {c.mobile_no && c.mobile_no !== '—' && c.mobile_no !== '0' && (
                              <div style={{ fontSize: '11px', marginTop: '2px' }}>
                                <a
                                  href={`tel:${String(c.mobile_no).split(',')[0].trim()}`}
                                  style={{ textDecoration: 'none', color: '#2563EB', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                  title={`Call: ${c.mobile_no}`}
                                >
                                  📞 {c.mobile_no}
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="text-end">
                            <div className="fw-bold text-danger" style={{ fontSize: '12.5px' }}>
                              {formatAmount(c.pending_amount)}
                            </div>
                            <span style={{ fontSize: '10px', color: chartSubtextColor }}>
                              Received: {formatAmount(c.received_amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted" style={{ fontSize: '12px' }}>
                      No pending dues found
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ════════════════════ ROW 4: Project Average Rates & Quarterly Trend ════════════════════ */}
          <Row className="g-3 mt-1 align-items-stretch">
            {/* 1. Project-wise Average Rate */}
            <Col lg={6}>
              <Card className="analytics-card h-100 shadow-sm d-flex flex-column">
                <Card.Header className="bg-transparent border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiBarChart2 size={18} />
                    </div>
                    <div>
                      <span className="analytics-card-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                        Project Average Rate (₹/Sq.Ft)
                      </span>
                      <div style={{ fontSize: '11px', color: chartSubtextColor }}>
                        Average plot rate per sq.ft across projects
                      </div>
                    </div>
                  </div>
                  <span className="badge analytics-badge-primary" style={{ fontSize: '11px', padding: '5px 9px' }}>
                    {graphData?.project_rates?.length || 0} Projects
                  </span>
                </Card.Header>
                <Card.Body className="p-2 flex-grow-1 d-flex flex-column justify-content-center">
                  <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="290px"
                    data={projectRateData}
                    options={projectRateOptions}
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* 2. Quarterly Trend & Growth */}
            <Col lg={6}>
              <Card className="analytics-card h-100 shadow-sm d-flex flex-column">
                <Card.Header className="bg-transparent border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiTrendingUp size={18} />
                    </div>
                    <div>
                      <span className="analytics-card-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                        Quarterly Sales & Collection Growth
                      </span>
                      <div style={{ fontSize: '11px', color: chartSubtextColor }}>
                        3-Month Performance of Bookings & Collections
                      </div>
                    </div>
                  </div>
                  <span className="badge analytics-badge-warning" style={{ fontSize: '11px', padding: '5px 9px' }}>
                    Quarterly Trend
                  </span>
                </Card.Header>
                <Card.Body className="p-2 flex-grow-1 d-flex flex-column justify-content-center">
                  <Chart
                    chartType="ComboChart"
                    width="100%"
                    height="290px"
                    data={quarterlyData}
                    options={quarterlyOptions}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default DashboardAnalyticsCharts;
