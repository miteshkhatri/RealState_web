import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import navigation from "../../../menu-items";
import { BASE_TITLE } from "../../../config/constant";
import { ConfigContext } from "../../../contexts/ConfigContext";
import * as actionType from "../../../store/actions";


const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    state: { collapseMenu },
    dispatch,
  } = useContext(ConfigContext);

  const [main, setMain] = useState(null);
  const [item, setItem] = useState(null);

  const pathname = location.pathname;
  const modifiedPathname = pathname.substring(1);
  const menuItems = navigation();

  useEffect(() => {
    if (!menuItems?.items) return;
    menuItems.items.forEach((menuGroup, index) => {
      if (menuGroup.type === "group") {
        findCollapse(menuGroup, index);
      }
    });
  }, [location.pathname]);

  const findCollapse = (menuGroup, index) => {
    if (!menuGroup.children) return;
    menuGroup.children.forEach((collapse) => {
      if (collapse.type === "collapse") {
        findCollapse(collapse, index);
      } else if (
        collapse.type === "item" &&
        location.pathname.startsWith(collapse.url)
      ) {
        setMain(menuGroup);
        setItem(collapse);
      }
    });
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 992) {
      dispatch({ type: actionType.COLLAPSE_MENU });
    }
  };

  const specialBreadcrumbs = {
    "projects/createproject": "Projects / Create Project",
  };

  const isMapRoute = pathname.includes('/project/map');
  const mapProjectId = isMapRoute ? pathname.split('/').filter(Boolean).pop() : null;

  const [projectName, setProjectName] = useState(() => {
    if (window.currentProjectName) return window.currentProjectName;
    try {
      const stored = JSON.parse(localStorage.getItem('ProjectData') || '{}');
      if (stored?.project_id == mapProjectId && stored?.name && stored.name !== 'Rameshwarm Market') {
        return stored.name;
      }
    } catch (e) {}
    return '';
  });

  useEffect(() => {
    const handleProjectName = (e) => {
      if (e.detail) setProjectName(e.detail);
    };
    window.addEventListener('projectNameUpdated', handleProjectName);
    return () => window.removeEventListener('projectNameUpdated', handleProjectName);
  }, []);

  const cleanedSegments = modifiedPathname
    .split("/")
    .filter((seg) => seg !== "" && !/^\d+$/.test(seg));

  // Build crumbs array — each segment becomes a crumb
  let crumbs = cleanedSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + cleanedSegments.slice(0, i + 1).join('/'),
  }));

  if (isMapRoute) {
    crumbs = [
      { label: 'Projects', path: '/projects' },
      { label: 'Map', path: pathname },
    ];
  }

  const pageTitle =
    (isMapRoute ? (projectName || 'Project Map') : null) ||
    specialBreadcrumbs[modifiedPathname] ||
    (crumbs.length > 0 ? crumbs[crumbs.length - 1].label : "Dashboard");

  useEffect(() => {
    document.title = pageTitle + BASE_TITLE;
  }, [pageTitle]);

  if (pathname === "/login") return null;

  return (
    <div className="bc-wrapper" style={{ padding: 0, display: 'flex', alignItems: 'center' }}>
      {/* Mobile hamburger */}
      <button
        type="button"
        className="bc-hamburger d-lg-none"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <i className={`feather ${collapseMenu ? 'icon-x' : 'icon-menu'}`} />
      </button>

      {/* Mobile Project Title on Map Page */}
      {isMapRoute && (
        <div
          className="bc-page-title d-flex d-lg-none"
          style={{
            marginLeft: '8px',
            maxWidth: '160px',
            overflow: 'hidden',
            display: 'inline-flex',
            alignItems: 'center'
          }}
          title={pageTitle}
        >
          <span className="bc-page-dot" style={{ flexShrink: 0 }} />
          <span
            className="bc-page-label"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '12px'
            }}
          >
            {pageTitle}
          </span>
        </div>
      )}

      {/* Desktop breadcrumb */}
      <div className="bc-content d-none d-lg-flex" style={{ gap: '10px' }}>

        {/* Page title pill */}
        <div
          className="bc-page-title"
          style={{
            marginLeft: 0,
            maxWidth: isMapRoute ? '135px' : '240px',
            overflow: 'hidden'
          }}
          title={pageTitle}
        >
          <span className="bc-page-dot" style={{ flexShrink: 0 }} />
          <span
            className="bc-page-label"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {pageTitle}
          </span>
        </div>

        {/* Divider */}
        <div className="bc-divider" />

        {/* Crumb trail */}
        <nav className="bc-trail" aria-label="breadcrumb">
          {/* Home */}
          <Link to="/dashboard" className="bc-crumb bc-crumb-home">
            <i className="feather icon-home bc-home-icon" />
          </Link>

          {crumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <i className="feather icon-chevron-right bc-sep" />
              <Link
                to={crumb.path}
                className={`bc-crumb ${i === crumbs.length - 1 ? 'bc-crumb-active' : ''}`}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>

      </div>
    </div>
  );
};

export default Breadcrumb;