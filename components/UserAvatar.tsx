import React from 'react';
import { FaUser } from 'react-icons/fa';

interface UserAvatarProps {
  photoUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  photoUrl,
  firstName,
  lastName,
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = () => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const getBackgroundColor = () => {
    const name = `${firstName || ''}${lastName || ''}`;
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    
    if (!name) return colors[0];
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const baseClasses = `${sizeClasses[size]} rounded-full overflow-hidden border border-gray-200 flex items-center justify-center font-medium text-white ${getBackgroundColor()} ${className}`;

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${firstName || ''} ${lastName || ''}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = getInitials() || '<FaUser />';
              }
            }}
          />
        ) : getInitials() ? (
          getInitials()
        ) : (
          <FaUser />
        )}
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`${firstName || ''} ${lastName || ''}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = getInitials() || '<FaUser />';
            }
          }}
        />
      ) : getInitials() ? (
        getInitials()
      ) : (
        <FaUser />
      )}
    </div>
  );
};

export default UserAvatar; 