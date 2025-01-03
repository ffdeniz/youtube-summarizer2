import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Skeleton from './Skeleton';

interface ContentDisplayProps {
  content: string;
  isLoading: boolean;
}

export default function ContentDisplay({ content, isLoading }: ContentDisplayProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-16rem)] relative">
      {content && (
        <button
          onClick={handleCopy}
          disabled={isLoading || !content}
          className="absolute top-2 right-8 text-gray-500 hover:text-gray-700 disabled:opacity-50 p-1 bg-gray-100 rounded-md z-10"
        >
          {isCopied ? 'Copied!' : 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          }
        </button>
      )}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {isLoading ? (
          <div className="py-4">
            <Skeleton />
          </div>
        ) : content ? (
          <div className="w-full p-4 before:rounded-md"
            style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap'}}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">No content available</p>
        )}
      </div>
    </div>
  );
} 