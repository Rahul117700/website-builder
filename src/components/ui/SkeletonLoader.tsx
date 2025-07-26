interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'button' | 'avatar' | 'table';
  lines?: number;
  className?: string;
}

export default function SkeletonLoader({ 
  type = 'text', 
  lines = 3,
  className = '' 
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white dark:bg-black rounded-lg shadow p-6 ${className}`}>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          </div>
        );
      
      case 'button':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg w-24"></div>
          </div>
        );
      
      case 'avatar':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
          </div>
        );
      
      case 'table':
        return (
          <div className={`animate-pulse ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
            ))}
          </div>
        );
      
      case 'text':
      default:
        return (
          <div className={`animate-pulse ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
              <div 
                key={i} 
                className={`h-3 bg-gray-200 dark:bg-slate-700 rounded mb-2 ${
                  i === lines - 1 ? 'w-2/3' : 'w-full'
                }`}
              ></div>
            ))}
          </div>
        );
    }
  };

  return renderSkeleton();
} 