import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-indigo-600 animate-spin"></div>
        <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-r-4 border-l-4 border-transparent border-opacity-50 animate-pulse"></div>
      </div>
    </div>
  );
}

export default LoadingSpinner;