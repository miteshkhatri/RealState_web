import React from 'react';
import { Spinner } from 'react-bootstrap';
import './ThemeLoader.css';

const ThemeLoader = () => {
  return (
    <div className="theme-loader-wrapper">
      <div className="theme-loader-content">
        <Spinner animation="border" className="theme-spinner" />
        <div className="theme-loader-text">Loading Data...</div>
      </div>
    </div>
  );
};

export default ThemeLoader;
