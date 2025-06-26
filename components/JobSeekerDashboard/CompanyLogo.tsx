import React from 'react';

interface CompanyLogoProps {
  company: string;
  logoPath?: string | null;
  className?: string;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({ company, logoPath, className = '' }) => {
  // Transform the local path to a URL accessible by the frontend
  const getLogoUrl = () => {
    if (!logoPath) return null;
    
    // Extract just the filename from the path
    const filename = logoPath.split(/[\\/]/).pop();
    return `api/uploads/${filename}`;
  };

  const logoUrl = getLogoUrl();

  return (
    <div className={`relative h-12 w-12 rounded-full overflow-hidden ${className}`}>
      {logoUrl ? (
        <>
          <img
            src={logoUrl}
            alt={`${company} logo`}
            className="absolute h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.hidden = false;
            }}
          />
          <div 
            className="flex items-center justify-center h-full w-full bg-gray-200"
            hidden
          >
            <span className="text-gray-600 text-lg font-medium">
              {company.charAt(0).toUpperCase()}
            </span>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-gray-200">
          <span className="text-gray-600 text-lg font-medium">
            {company.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};

export default CompanyLogo;