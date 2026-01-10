import React, { useState } from 'react';
import CheckoutModal from './CheckoutModal';
import analytics from './analytics/analytics';

const StickyBuyNow: React.FC = () => {
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        analytics.track('buy_now_click');
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    return (
        <>
            <button
                onClick={handleClick}
                className="fixed bottom-6 right-6 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition"
            >
                Buy Now
            </button>
            {open && <CheckoutModal onClose={handleClose} />}
        </>
    );
};

export default StickyBuyNow;
