'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useState } from 'react';

export default function OrderTemplatePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [requirements, setRequirements] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Integrate with backend to handle order
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Custom Template</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Request a custom website template tailored to your needs.
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 mb-8">
        {submitted ? (
          <div className="text-green-600 dark:text-green-400 font-semibold text-center">Your request has been submitted!</div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label" htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                className="input-field"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="requirements">Requirements</label>
              <textarea
                id="requirements"
                className="input-field"
                rows={4}
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full">Submit Request</button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
} 