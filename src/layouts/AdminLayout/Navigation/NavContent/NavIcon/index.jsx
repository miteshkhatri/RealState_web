import PropTypes from 'prop-types';
import React from 'react';
import { 
  FiHome, 
  FiFolder,
  FiGrid,
  FiCalendar, 
  FiBookOpen, 
  FiDollarSign, 
  FiUsers, 
  FiUser,
  FiSliders,
  FiDownload,
  FiFileText,
  FiBriefcase
} from 'react-icons/fi';

const NavIcon = ({ items }) => {
  if (!items.icon) return null;

  const iconName = items.icon.toLowerCase();
  let IconComponent = null;

  if (iconName.includes('home')) {
    IconComponent = FiHome;
  } else if (iconName.includes('server') || iconName.includes('project')) {
    IconComponent = FiFolder;
  } else if (iconName.includes('calendar')) {
    IconComponent = FiCalendar;
  } else if (iconName.includes('book')) {
    IconComponent = FiBookOpen;
  } else if (iconName.includes('briefcase')) {
    IconComponent = FiBriefcase;
  } else if (iconName.includes('box') || iconName.includes('receive') || iconName.includes('dollar')) {
    IconComponent = FiDollarSign;
  } else if (iconName.includes('download')) {
    IconComponent = FiDownload;
  } else if (iconName.includes('file-text') || iconName.includes('report')) {
    IconComponent = FiFileText;
  } else if (iconName.includes('layers') || iconName.includes('property')) {
    IconComponent = FiGrid;
  } else if (iconName === 'feather icon-user') {
    IconComponent = FiUser;
  } else if (iconName.includes('users')) {
    IconComponent = FiUsers;
  } else {
    IconComponent = FiSliders;
  }

  return (
    <span className="pcoded-micon">
      <IconComponent size={20} style={{ strokeWidth: '2.2px' }} />
    </span>
  );
};

NavIcon.propTypes = {
  items: PropTypes.object,
  icon: PropTypes.string
};

export default NavIcon;

