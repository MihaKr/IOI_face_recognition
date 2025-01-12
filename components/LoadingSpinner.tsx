import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center p-4">
            {/* Primary spinner */}
            <div className="relative inline-flex">
                {/* Background circle */}
                <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>

                {/* Spinning circle */}
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>

                {/* Optional: Blur effect for depth */}
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-blue-300 border-t-transparent animate-pulse opacity-50 blur-sm"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;