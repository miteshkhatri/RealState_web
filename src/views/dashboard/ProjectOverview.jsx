import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FiMap, FiTrendingUp, FiAlertCircle, FiCalendar, FiCheck } from 'react-icons/fi';
import '../style.css';
import api from 'utils/api';

const ProjectOverview = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem('users'));
  const navigate = useNavigate();

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '0';
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return num.toLocaleString('en-IN');
  };

  const formatAmount = (value) => {
    if (value === null || value === undefined || value === '') return '₹0';
    const num = Number(value);
    if (Number.isNaN(num)) return `₹${value}`;
    const hasDecimals = Math.abs(num - Math.trunc(num)) > 0;
    const formatted = hasDecimals
      ? num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : num.toLocaleString('en-IN');
    return `₹${formatted}`;
  };

  const fetchProjects = async (assignedOnly = false) => {
    if (!userData?.user_token) return;
    const userId = userData?.user_id ?? userData?.id ?? null;

    if (assignedOnly && !userId) {
      console.warn('fetchProjects: assignedOnly requested but no user id available.');
      setProjects([]);
      return;
    }

    setLoading(true);
    try {
      const params = {};
      if (userId) params.user_id = userId;
      if (assignedOnly) params.assigned_only = 1;

      const res = await api.get(`/dashboard/projectData`, {
        headers: { Authorization: userData.user_token },
        params,
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        setProjects(res.data.data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const goToDetails = (projectId, filter = 'all') => {
    navigate(`/dashboard/projects/details?project_id=${projectId}&filter=${filter}`);
  };

  const goToMap = (projectId) => {
    navigate(`/project/map/${projectId}`);
  };

  const makeActivationProps = (onActivate) => ({
    onClick: (e) => {
      e.stopPropagation();
      onActivate();
    },
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onActivate();
      }
    },
    role: 'button',
    tabIndex: 0,
    style: { cursor: 'pointer' },
  });

  return (
    <>
      {/* ─── CSS Styles ─── */}
      <style>{`
        /* ============================================================
           🌗 PROJECT OVERVIEW — Dual Mode (Light + Dark)
           Premium Real Estate Theme
           ============================================================ */

        /* ─── Container ─── */
        .project-overview-wrapper {
          padding: 0 4px;
        }

        /* ─── Header ─── */
        .project-overview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          margin-top: 24px;
        }

        .project-overview-header .title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.02em;
          color: #0D1B2A;
        }

        .project-overview-header .subtitle {
          font-size: 13px;
          color: #6B7280;
          margin: 2px 0 0;
          font-weight: 400;
        }

        /* ─── Dark Mode Header ─── */
        body.dark-theme .project-overview-header .title {
          color: #F4F4F4;
        }

        body.dark-theme .project-overview-header .subtitle {
          color: rgba(244, 244, 244, 0.55);
        }

        /* ─── Loading State ─── */
        .project-loading {
          text-align: center;
          margin: 48px 0;
        }

        .project-loading .spinner {
          color: #C9A84C;
        }

        .project-loading .text {
          margin-top: 8px;
          color: #6B7280;
        }

        body.dark-theme .project-loading .text {
          color: rgba(244, 244, 244, 0.55);
        }

        /* ─── No Projects ─── */
        .project-empty {
          text-align: center;
          margin-top: 48px;
        }

        .project-empty .text {
          font-size: 18px;
          color: #6B7280;
        }

        body.dark-theme .project-empty .text {
          color: rgba(244, 244, 244, 0.55);
        }

        /* ─── Project Card ─── */
        .project-card-mt {
          background: #FFFFFF;
          border: 1px solid #E8ECF0;
          border-radius: 14px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          overflow: hidden;
          height: 100%;
        }

        .project-card-mt:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
          border-color: #C9A84C;
        }

        .project-card-mt .card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }

        /* ─── Dark Mode Card ─── */
        body.dark-theme .project-card-mt {
          background: #1E3A5F;
          border: 1px solid rgba(201, 168, 76, 0.08);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        body.dark-theme .project-card-mt:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
          border-color: rgba(201, 168, 76, 0.25);
        }

        /* ─── Card Header ─── */
        .project-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid #F1F4F9;
        }

        .project-card-header .project-name {
          color: #0D1B2A;
          font-size: 15px;
          letter-spacing: -0.02em;
          font-weight: 700;
          margin: 0;
        }

        .project-card-header .plot-badge {
          background: #FBF3E0;
          color: #C9A84C;
          font-weight: 600;
          font-size: 10px;
          border-radius: 20px;
          border: 1px solid #F5E6C8;
          padding: 4px 12px;
        }

        /* ─── Dark Mode Card Header ─── */
        body.dark-theme .project-card-header {
          border-bottom: 1px solid rgba(201, 168, 76, 0.08);
        }

        body.dark-theme .project-card-header .project-name {
          color: #F4F4F4;
        }

        body.dark-theme .project-card-header .plot-badge {
          background: rgba(201, 168, 76, 0.12);
          color: #E8C56A;
          border: 1px solid rgba(201, 168, 76, 0.15);
        }

        /* ─── Stats Boxes ─── */
        .stats-box {
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          padding: 8px 2px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 64px;
          height: 100%;
        }

        .stats-box:hover {
          transform: scale(1.04);
        }

        .stats-box .value {
          font-size: 17px;
          font-weight: 700;
          line-height: 1.2;
        }

        .stats-box .label {
          font-size: 7.5px;
          color: #94A3B8;
          font-weight: 700;
          letter-spacing: -0.2px;
          text-transform: uppercase;
          margin-top: 4px;
          white-space: nowrap;
          line-height: 1.1;
        }

        /* Booked Stats - Light Mode */
        .stats-booked {
          background: #E6F9F0;
        }
        .stats-booked .value {
          color: #2ECC71;
        }

        /* Completed Stats - Light Mode */
        .stats-completed {
          background: #EFF6FF;
        }
        .stats-completed .value {
          color: #3B82F6;
        }

        /* Sold Stats - Light Mode */
        .stats-sold {
          background: #F5F3FF;
        }
        .stats-sold .value {
          color: #8B5CF6;
        }

        /* Available Stats - Light Mode */
        .stats-available {
          background: #FBF3E0;
        }
        .stats-available .value {
          color: #C9A84C;
        }

        /* ─── Dark Mode Stats Boxes ─── */
        body.dark-theme .stats-booked {
          background: rgba(46, 204, 113, 0.12);
        }
        body.dark-theme .stats-booked .value {
          color: #2ECC71;
        }

        body.dark-theme .stats-completed {
          background: rgba(59, 130, 246, 0.12);
        }
        body.dark-theme .stats-completed .value {
          color: #3B82F6;
        }

        body.dark-theme .stats-sold {
          background: rgba(139, 92, 246, 0.12);
        }
        body.dark-theme .stats-sold .value {
          color: #8B5CF6;
        }

        body.dark-theme .stats-available {
          background: rgba(201, 168, 76, 0.12);
        }
        body.dark-theme .stats-available .value {
          color: #E8C56A;
        }

        body.dark-theme .stats-box .label {
          color: rgba(244, 244, 244, 0.55);
        }

        /* ─── Progress Bar ─── */
        .progress-mt {
          height: 6px;
          background: #F1F4F9;
          border-radius: 99px;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .progress-mt .progress-completed {
          background: #2ECC71;
        }
        .progress-mt .progress-booked {
          background: #C9A84C;
        }
        .progress-mt .progress-pending {
          background: #D1D5DB;
        }

        /* ─── Dark Mode Progress Bar ─── */
        body.dark-theme .progress-mt {
          background: rgba(244, 244, 244, 0.06);
        }

        body.dark-theme .progress-mt .progress-booked {
          background: #E8C56A;
        }

        body.dark-theme .progress-mt .progress-pending {
          background: rgba(244, 244, 244, 0.15);
        }

        /* ─── Amount Section ─── */
        .amount-section {
          background: #F8FAFC;
          border-radius: 12px;
          border: 1px solid #F1F4F9;
          padding: 14px;
        }

        .amount-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .amount-label {
          font-size: 11px;
          font-weight: 500;
          color: #64748B;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .amount-value {
          font-weight: 700;
          font-size: 15px;
          margin-top: 2px;
        }

        .amount-value.received {
          color: #2ECC71;
        }
        .amount-value.pending {
          color: #E74C3C;
        }

        .amount-divider {
          border-color: #F1F4F9;
          margin: 8px 0;
        }

        /* ─── Dark Mode Amount Section ─── */
        body.dark-theme .amount-section {
          background: rgba(244, 244, 244, 0.03);
          border: 1px solid rgba(201, 168, 76, 0.06);
        }

        body.dark-theme .amount-label {
          color: rgba(244, 244, 244, 0.55);
        }

        body.dark-theme .amount-divider {
          border-color: rgba(201, 168, 76, 0.06);
        }

        /* ─── Today Boxes ─── */
        .today-box {
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 6px 12px;
        }

        .today-box:hover {
          transform: scale(1.03);
        }

        .today-box .today-label {
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .today-box .today-value {
          font-weight: 700;
          font-size: 14px;
          margin-top: 1px;
        }

        /* Light Mode Today Boxes */
        .today-received {
          background: #E6F9F0;
        }
        .today-received .today-label {
          color: #2ECC71;
        }
        .today-received .today-value {
          color: #2ECC71;
        }

        .today-booked {
          background: #FBF3E0;
        }
        .today-booked .today-label {
          color: #C9A84C;
        }
        .today-booked .today-value {
          color: #C9A84C;
        }

        .today-box-end {
          text-align: end;
        }
        .today-label-end {
          justify-content: flex-end;
        }

        /* ─── Dark Mode Today Boxes ─── */
        body.dark-theme .today-received {
          background: rgba(46, 204, 113, 0.10);
        }
        body.dark-theme .today-received .today-label {
          color: #2ECC71;
        }
        body.dark-theme .today-received .today-value {
          color: #2ECC71;
        }

        body.dark-theme .today-booked {
          background: rgba(232, 197, 106, 0.10);
        }
        body.dark-theme .today-booked .today-label {
          color: #E8C56A;
        }
        body.dark-theme .today-booked .today-value {
          color: #E8C56A;
        }

        /* ─── Responsive ─── */
        @media (max-width: 768px) {
          .project-card-header .project-name {
            font-size: 13px;
          }
          .stats-box .value {
            font-size: 15px;
          }
          .amount-value {
            font-size: 13px;
          }
          .today-box .today-value {
            font-size: 12px;
          }
        }

        @media (max-width: 576px) {
          .project-card-mt .card-body {
            padding: 16px;
          }
          .stats-box .value {
            font-size: 13px;
          }
          .stats-box .label {
            font-size: 6.5px;
            letter-spacing: -0.3px;
          }
        }
      `}</style>

      {/* ─── HEADER ─── */}
      <div className="project-overview-header">
        <div>
          <h4 className="title">Active Projects Overview</h4>
          <p className="subtitle">Real-time plot allotments and collection summary.</p>
        </div>
      </div>

      {/* ─── LOADING ─── */}
      {loading && (
        <div className="project-loading">
          <Spinner animation="border" className="spinner" />
          <p className="text">Loading projects...</p>
        </div>
      )}

      {/* ─── CARDS ─── */}
      {!loading && (
        <Row>
          {projects.map((project) => {
            const totalPlots       = Number(project.total_plots) || 0;
            const totalBooked      = Number(project.total_booked) || 0;
            const totalPending     = Number(project.total_pending_plots) || 0;
            const totalCompleted   = Number(project.total_completed) || 0;
            const totalTodayBooked = Number(project.total_today_booked) || 0;

            const bookedPercent    = totalPlots ? Math.min(100, Math.max(0, (totalBooked / totalPlots) * 100)) : 0;
            const completedPercent = totalPlots ? Math.min(100, Math.max(0, (totalCompleted / totalPlots) * 100)) : 0;
            const pendingPercent   = totalPlots ? Math.min(100, Math.max(0, (totalPending / totalPlots) * 100)) : 0;

            const onCardActivate = () => goToDetails(project.project_id, 'all');

            return (
              <Col key={project.project_id} md={4} className="mb-4">
                <div 
                  className="project-card-mt" 
                  onClick={onCardActivate}
                >
                  <div className="card-body">
                    <div>
                      {/* ─── PROJECT NAME ─── */}
                      <div className="project-card-header">
                        <h5 className="project-name">
                          {project.project_name}
                        </h5>
                        <div className="d-flex gap-2 align-items-center">
                          <span className="plot-badge">
                            {formatNumber(totalPlots)} Plots
                          </span>
                        </div>
                      </div>

                      {/* ─── PLOT STATS - 4 BOXES ─── */}
                      <div className="row g-2 mb-3">
                        {/* Booked Plots */}
                        <div className="col-3">
                          <div
                            className="stats-box stats-booked"
                            {...makeActivationProps(() => goToDetails(project.project_id, 'booked'))}
                          >
                            <div className="value">{formatNumber(totalBooked)}</div>
                            <div className="label">Booked</div>
                          </div>
                        </div>

                        {/* Completed Plots */}
                        <div className="col-3">
                          <div 
                            className="stats-box stats-completed"
                            {...makeActivationProps(() => goToDetails(project.project_id, 'completed'))}
                          >
                            <div className="value">{formatNumber(totalCompleted)}</div>
                            <div className="label">Completed</div>
                          </div>
                        </div>

                        {/* Sold Plots (Booked + Completed) */}
                        <div className="col-3">
                          <div
                            className="stats-box stats-sold"
                            {...makeActivationProps(() => goToDetails(project.project_id, 'sold'))}
                          >
                            <div className="value">{formatNumber(totalBooked + totalCompleted)}</div>
                            <div className="label">Sold</div>
                          </div>
                        </div>

                        {/* Available Plots */}
                        <div className="col-3">
                          <div 
                            className="stats-box stats-available"
                            {...makeActivationProps(() => goToDetails(project.project_id, 'available'))}
                          >
                            <div className="value">{formatNumber(totalPending)}</div>
                            <div className="label">Available</div>
                          </div>
                        </div>
                      </div>

                      {/* ─── PROGRESS BAR ─── */}
                      <div className="progress-mt">
                        <div 
                          className="progress-completed" 
                          style={{ width: `${completedPercent}%`, height: '100%', float: 'left' }}
                        />
                        <div 
                          className="progress-booked" 
                          style={{ width: `${bookedPercent}%`, height: '100%', float: 'left' }}
                        />
                        <div 
                          className="progress-pending" 
                          style={{ width: `${pendingPercent}%`, height: '100%', float: 'left' }}
                        />
                      </div>

                      {/* ─── AMOUNT SECTION ─── */}
                      <div className="amount-section">
                        {/* Total Received & Pending Amount */}
                        <div className="amount-row">
                          <div>
                            <div className="amount-label">
                              <FiTrendingUp size={12} style={{ color: '#2ECC71' }} /> Total Received
                            </div>
                            <div className="amount-value received">
                              {formatAmount(project.total_received_amount)}
                            </div>
                          </div>
                          <div 
                            className="text-end" 
                            {...makeActivationProps(() => goToDetails(project.project_id, 'pending'))}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="amount-label justify-content-end">
                              <FiAlertCircle size={12} style={{ color: '#E74C3C' }} /> Pending Amount
                            </div>
                            <div className="amount-value pending">
                              {formatAmount(project.pending_amount)}
                            </div>
                          </div>
                        </div>

                        <hr className="amount-divider" />

                        {/* Today Received & Today Booked */}
                        <div className="d-flex justify-content-between">
                          <div
                            className="today-box today-received"
                            {...makeActivationProps(() => goToDetails(project.project_id, 'today_received'))}
                          >
                            <div className="today-label">
                              <FiCalendar size={11} /> Today Received
                            </div>
                            <div className="today-value">
                              {formatAmount(project.total_today_received)}
                            </div>
                          </div>
                          <div
                            className="today-box today-booked today-box-end"
                            {...makeActivationProps(() => goToDetails(project.project_id, 'today'))}
                          >
                            <div className="today-label today-label-end">
                              <FiCheck size={11} /> Today Booked
                            </div>
                            <div className="today-value">
                              {formatNumber(totalTodayBooked)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}

          {projects.length === 0 && !loading && (
            <div className="project-empty">
              <p className="text">No projects found.</p>
            </div>
          )}
        </Row>
      )}
    </>
  );
};

export default ProjectOverview;