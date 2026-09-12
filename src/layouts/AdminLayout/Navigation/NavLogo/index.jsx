import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { ConfigContext } from '../../../../contexts/ConfigContext';
import * as actionType from '../../../../store/actions';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';


import sidebarImages from '../../../../../public/logo/logoAuth_1.png';

const NavLogo = () => {
  const configContext = useContext(ConfigContext);
  const { collapseMenu } = configContext.state;
  const { dispatch } = configContext;

  let toggleClass = ['mobile-menu'];
  if (collapseMenu) {
    toggleClass = [...toggleClass, 'on'];
  }

  return (
    <React.Fragment>
      <div
        className="header-logo d-flex align-items-center justify-content-between"
        style={{
          width: "100%",
          padding: "10px 16px",
          gap: "10px",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
          borderBottom: "1px solid rgba(244, 244, 244, 0.06)",
        }}
      >
        {/* ─── Logo / Brand ─── */}
        <Link
          to="#"
          className="b-brand d-flex align-items-center"
          style={{
            textDecoration: "none",
            gap: "0px",
            flexShrink: 0,
          }}
        >
          <div
            className="b-bg"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "70px",
              height: "70px",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src={sidebarImages}
              alt="Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: "4px",
                opacity: 1,
                transform: "none",
              }}
            />
          </div>
          <span
            className="b-title"
            style={{
              color: "#F4F4F4",
              fontWeight: 800,
              fontSize: "17px",
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #F4F4F4 40%, #E8C56A)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              whiteSpace: "nowrap",
            }}
          >
            Real Estate
          </span>
        </Link>

        {/* ─── Toggle Button ─── */}
        <Link
          to="#"
          className={`${toggleClass.join(' ')} toggle-button`}
          id="mobile-collapse"
          onClick={(e) => {
            e.preventDefault();
            dispatch({ type: actionType.COLLAPSE_MENU });
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            background: "transparent",
            border: "1px solid rgba(244, 244, 244, 0.10)",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(244, 244, 244, 0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          {collapseMenu ? <FiChevronRight size={20} color="#E8C56A" /> : <FiChevronLeft size={20} color="#E8C56A" />}
        </Link>
      </div>
    </React.Fragment>
  );
};

export default NavLogo;