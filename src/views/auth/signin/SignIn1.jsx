import React from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
 
import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';



import AuthLogin from './JWTLogin';

const Signin1 = () => {
  const logoUrl = `${import.meta.env.BASE_URL || '/'}logo/logoAuth.png`;

  return (
    <React.Fragment>
      <Breadcrumb />
      <div className="auth-wrapper">
        <div className="auth-container-split">
          {/* Left panel (Illustration / Brand / Deco) */}
          <div className="auth-left-pane">
            <div className="deco-graphic">
              <div className="deco-circle deco-circle-1"></div>
              <div className="deco-circle deco-circle-2"></div>
              <div className="deco-grid"></div>
            </div>
            <div className="auth-left-content">
              <div className="brand-logo-glow">
                <img src={logoUrl} alt="Logo" className="brand-logo-img" />
              </div>
              <h1 className="brand-title">Real Estate</h1>
              <p className="brand-tagline">Secure Management & Operations Portal</p>
            </div>
          </div>
          
          {/* Right panel (Login form) */}
          <div className="auth-right-pane">
            <div className="auth-content auth-entrance">
              <Card className="borderless text-center ">
                <Card.Body>
                  <div className="">
                    <i className="feather icon-unlock auth-icon" />
                  </div>
                  <AuthLogin />
                </Card.Body>
                
              </Card>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Signin1;
