import React from 'react';
import { Button } from 'react-bootstrap';
import { FiX } from 'react-icons/fi';

function LogoutModel({
  handleFun,
  setShowModal,
  title,
  subtitle,
  btnText,
  cancelText,
  projectId
}) {
  const isDark = document.body.classList.contains('dark-theme') || localStorage.getItem('theme') === 'dark';

  const bgCard = isDark ? '#1E3A5F' : '#ffffff';
  const textPrimary = isDark ? '#F4F4F4' : '#0f172a';
  const textSecondary = isDark ? 'rgba(244, 244, 244, 0.7)' : '#64748b';
  const borderColor = isDark ? 'rgba(201, 168, 76, 0.15)' : '#e2e8f0';
  
  // Cancel button
  const cancelBg = isDark ? '#1B2D45' : '#ffffff';
  const cancelBorder = isDark ? 'rgba(201, 168, 76, 0.3)' : '#cbd5e1';
  const cancelHoverBg = isDark ? 'rgba(201, 168, 76, 0.08)' : '#f8fafc';
  
  // Main action button
  const isDelete = btnText === 'Delete';
  const isLogout = btnText === 'Log Out';
  
  const mainBtnBg = isDelete 
    ? (isDark ? '#E74C3C' : '#dc2626')
    : (isDark ? 'linear-gradient(135deg, #C9A84C, #B8963A)' : (isLogout ? '#dc2626' : '#0f172a')); // Use Red for Logout in Light mode too, or Slate! Let's use #0f172a
  
  const mainBtnColor = isDelete ? '#ffffff' : (isDark ? '#0D1B2A' : '#ffffff');
  const mainBtnShadow = isDark && !isDelete ? '0 4px 12px rgba(201, 168, 76, 0.3)' : '0 2px 6px rgba(0,0,0,0.1)';

  return (
    <div
      className="modal fade show"
      style={{ 
        display: 'block', 
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 1050,
        backdropFilter: 'blur(3px)'
      }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0" style={{ 
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          background: bgCard,
          overflow: 'hidden'
        }}>
          
          {/* ⭐ Modal Header */}
          <div className="modal-header" style={{
            borderBottom: `1px solid ${borderColor}`,
            padding: '18px 24px'
          }}>
            <h5 className="modal-title" style={{
              fontFamily: 'var(--font, inherit)',
              fontWeight: 700,
              fontSize: '17px',
              color: textPrimary
            }}>
              {title || 'Confirm Action'}
            </h5>
            {/* Cross Button Removed per user request */}
          </div>

          {/* ⭐ Modal Body */}
          <div className="modal-body" style={{
            padding: '24px',
            fontFamily: 'var(--font, inherit)',
            fontSize: '15px',
            color: textSecondary,
            lineHeight: 1.6
          }}>
            <p style={{ margin: 0 }}>{subtitle || 'Are you sure?'}</p>
          </div>

          {/* ⭐ Modal Footer */}
          <div className="modal-footer" style={{
            borderTop: `1px solid ${borderColor}`,
            padding: '16px 24px',
            gap: '12px',
            background: isDark ? 'rgba(0,0,0,0.1)' : '#f8fafc'
          }}>
            {/* Cancel Button */}
            <Button
              variant="secondary"
              className="px-4 py-2 border-0"
              onClick={() => setShowModal(false)}
              style={{
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                background: cancelBg,
                border: `1px solid ${cancelBorder}`,
                color: textPrimary,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = cancelHoverBg}
              onMouseLeave={(e) => e.currentTarget.style.background = cancelBg}
            >
              {cancelText || 'Cancel'}
            </Button>

            {/* Main Action Button */}
            <Button
              className="px-4 py-2 border-0"
              onClick={() => {
                if (btnText === 'Delete') {
                  handleFun(projectId);
                } else {
                  handleFun();
                }
                setShowModal(false);
              }}
              style={{
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                background: mainBtnBg,
                color: mainBtnColor,
                boxShadow: mainBtnShadow,
                transition: 'all 0.2s transform 0.1s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = mainBtnShadow ? mainBtnShadow.replace('0.15', '0.25').replace('0.3', '0.4') : 'none';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = mainBtnShadow || 'none';
              }}
            >
              {btnText || 'Confirm'}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LogoutModel;