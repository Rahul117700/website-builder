import React from 'react';
import analytics from './analytics/analytics';

interface CTAButtonProps {
    text?: string;
    onClick?: () => void;
    className?: string;
}

const CTAButton: React.FC<React.PropsWithChildren<CTAButtonProps>> = ({ text, children, onClick, className = '' }) => {
    const handleClick = () => {
        analytics.track('cta_click');
        if (onClick) onClick();
    };

    return (
        <button
            onClick={handleClick}
            className={`px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center ${className}`}
        >
            {text || children}
        </button>
    );
};

export default CTAButton;
