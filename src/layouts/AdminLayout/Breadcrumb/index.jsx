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

  const cleanedSegments = modifiedPathname
    .split("/")
    .filter((seg) => seg !== "" && !/^\d+$/.test(seg));

  // Build crumbs array — each segment becomes a crumb
  const crumbs = cleanedSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + cleanedSegments.slice(0, i + 1).join('/'),
  }));

  const pageTitle =
    specialBreadcrumbs[modifiedPathname] ||
    (crumbs.length > 0 ? crumbs[crumbs.length - 1].label : "Dashboard");

  useEffect(() => {
    document.title = pageTitle + BASE_TITLE;
  }, [pageTitle]);

  if (pathname === "/login") return null;

  return (
    <div className="bc-wrapper">
      {/* Mobile hamburger */}
      <button
        type="button"
        className="bc-hamburger d-lg-none"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <i className={`feather ${collapseMenu ? 'icon-x' : 'icon-menu'}`} />
      </button>

      {/* Desktop breadcrumb */}
      <div className="bc-content d-none d-lg-flex">

        {/* Page title pill */}
        <div className="bc-page-title">
          <span className="bc-page-dot" />
          <span className="bc-page-label">{pageTitle}</span>
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