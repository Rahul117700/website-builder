'use client';

import { useState } from 'react';
import ContactForm from '../forms/ContactForm';
import SignupForm from '../forms/SignupForm';
import LoginForm from '../forms/LoginForm';

interface FormWidgetProps {
  siteId: string;
  formType: 'contact' | 'signup' | 'login';
  className?: string;
}

export default function FormWidget({ siteId, formType, className = '' }: FormWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);

  const renderForm = () => {
    switch (formType) {
      case 'contact':
        return <ContactForm siteId={siteId} className={className} />;
      case 'signup':
        return <SignupForm siteId={siteId} className={className} />;
      case 'login':
        return <LoginForm siteId={siteId} className={className} />;
      default:
        return <ContactForm siteId={siteId} className={className} />;
    }
  };

  const getFormTitle = () => {
    switch (formType) {
      case 'contact':
        return 'Contact Form';
      case 'signup':
        return 'Sign Up Form';
      case 'login':
        return 'Login Form';
      default:
        return 'Form';
    }
  };

  return (
    <div className="form-widget">
      {isEditing ? (
        <div className="p-4 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">{getFormTitle()}</h3>
            <p className="text-sm text-purple-600 mb-4">This form will collect submissions for your website</p>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              View Form
            </button>
          </div>
        </div>
      ) : (
        <div className="relative group">
          {renderForm()}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
              title="Edit form"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 