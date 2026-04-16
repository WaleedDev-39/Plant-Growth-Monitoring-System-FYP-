import React from 'react';

const Header = ({ title }) => {
  return (
    <div className="header">
      <h2>{title}</h2>
      <div className="user-info">
        <i className="fas fa-bell"></i>
        <img 
          src="https://ui-avatars.com/api/?name=University+Student&background=4caf50&color=fff" 
          alt="User" 
        />
      </div>
    </div>
  );
};

export default Header;