import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import HomeContent from '@/components/home/HomeContent';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default async function HelpPage() {
    const session = await getServerSession(authOptions);
    // In a real app, we might fetch help articles here

    return (
        <HomeContent>
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                        <QuestionMarkCircleIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Common Topics */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Popular Topics</h2>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-blue-600 hover:underline">Getting Started Guide</a></li>
                            <li><a href="#" className="text-blue-600 hover:underline">Account & Billing</a></li>
                            <li><a href="#" className="text-blue-600 hover:underline">Uploading Your First Product</a></li>
                            <li><a href="#" className="text-blue-600 hover:underline">Understanding Analytics</a></li>
                        </ul>
                    </div>

                    {/* Contact Support */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Need more help?</h2>
                        <p className="text-gray-600 mb-4">Our support team is available 24/7 to assist you with any issues.</p>
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </HomeContent>
    );
}
