'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

