import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ children, className = '', onClick, hover = false }) => (
  <div
    className={`card ${hover ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] transition-transform duration-150' : ''} ${className}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
  >
    {children}
  </div>
);

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  hover: PropTypes.bool,
};

export default Card;
