import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(({
  label,
  error,
  hint,
  id,
  required,
  className = '',
  inputClassName = '',
  ...rest
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        aria-invalid={!!error}
        className={`input-field ${error ? 'border-red-500 focus:ring-red-400' : ''} ${inputClassName}`}
        {...rest}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  id: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
};

export default Input;
