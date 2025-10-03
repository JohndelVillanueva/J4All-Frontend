import React, { useState, useRef, useCallback } from 'react';
import { FaCamera, FaTrash, FaUpload, FaUser } from 'react-icons/fa';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserPhotoUploadProps {
  currentPhotoUrl?: string;
  userId: number;
  onPhotoUpdate?: (photoUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserPhotoUpload: React.FC<UserPhotoUploadProps> = ({
  currentPhotoUrl,
  userId,
  onPhotoUpdate,
  size = 'md',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const uploadPhoto = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/photos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload photo');
      }

      // Update the photo URL
      if (onPhotoUpdate) {
        onPhotoUpdate(data.data.photo_url);
      }

      // Clear preview
      setPreviewUrl(null);

      return data.data.photo_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      await uploadPhoto(file);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!currentPhotoUrl) return;

    setIsUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/photos/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete photo');
      }

      // Update the photo URL
      if (onPhotoUpdate) {
        onPhotoUpdate('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
    } finally {
      setIsUploading(false);
    }
  };

  const displayUrl = previewUrl || currentPhotoUrl;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Photo Display */}
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUser className={`${iconSizes[size]} text-gray-400`} />
          )}
        </div>

        {/* Upload Overlay */}
        {!displayUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
            <FaCamera className={`${iconSizes[size]} text-white`} />
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <FaCamera className="text-sm" />
        </button>
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload/Delete Buttons */}
      <div className="flex space-x-2">
        {previewUrl && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FaUpload className="text-sm" />
            <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
          </button>
        )}

        {currentPhotoUrl && !previewUrl && (
          <button
            onClick={handleDelete}
            disabled={isUploading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <FaTrash className="text-sm" />
            <span>{isUploading ? 'Deleting...' : 'Delete'}</span>
          </button>
        )}

        {previewUrl && (
          <button
            onClick={() => {
              setPreviewUrl(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {error}
        </div>
      )}

      {/* Instructions */}
      {!displayUrl && (
        <div className="text-gray-500 text-sm text-center max-w-xs">
          Click the camera icon or drag and drop an image here
        </div>
      )}
    </div>
  );
};

export default UserPhotoUpload; 