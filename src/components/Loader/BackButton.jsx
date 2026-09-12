import React from "react";
import { useNavigate } from "react-router-dom";
import '../style.css';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)} className="btn-back">
      <i className="feather icon-arrow-left" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;