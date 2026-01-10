import React, { useState } from 'react';
import analytics from './analytics/analytics';

interface CheckoutModalProps {
    onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        analytics.track('checkout_start', { email });
        // In a real app, you would call your backend to create a Stripe Checkout Session.
        // Here we simulate a redirect after a short delay.
        setTimeout(() => {
            analytics.track('checkout_success', { email });
            setLoading(false);
            onClose();
            // Simulate redirect to Stripe test checkout page
            window.location.href = 'https://checkout.stripe.com/pay/cdemo';
        }, 1500);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-xl font-semibold mb-4">Complete Your Purchase</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Processing…' : 'Proceed to Checkout'}
                    </button>
                </form>
                <button
                    onClick={onClose}
                    className="mt-4 w-full text-gray-600 hover:underline"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CheckoutModal;
