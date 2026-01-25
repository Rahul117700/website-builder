import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import HomeContent from '@/components/home/HomeContent';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default async function FeedbackPage() {
    const session = await getServerSession(authOptions);

    return (
        <HomeContent>
            <div className="max-w-2xl mx-auto p-6">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-full text-indigo-600 mb-4">
                        <ChatBubbleLeftRightIcon className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Feedback</h1>
                    <p className="text-gray-600">We value your input! Let us know how we can improve your experience.</p>
                </div>

                <form className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Feedback Type</label>
                        <select id="type" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option>Suggestion</option>
                            <option>Bug Report</option>
                            <option>Compliment</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                        <textarea
                            id="message"
                            rows={5}
                            placeholder="Tell us what you think..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        ></textarea>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md">
                            Send Feedback
                        </button>
                    </div>
                </form>
            </div>
        </HomeContent>
    );
}
