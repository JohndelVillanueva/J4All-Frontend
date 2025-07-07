import React, { useState } from 'react';
import UserPhotoUpload from './UserPhotoUpload';
import UserAvatar from './UserAvatar';

const PhotoExample: React.FC = () => {
  const [currentPhoto, setCurrentPhoto] = useState<string>('');
  const [userInfo] = useState({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">User Photo System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Photo Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Photo Upload</h2>
          <UserPhotoUpload
            currentPhotoUrl={currentPhoto}
            userId={userInfo.id}
            onPhotoUpdate={setCurrentPhoto}
            size="lg"
          />
        </div>

        {/* Avatar Examples */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Avatar Examples</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 w-16">With Photo:</span>
              <UserAvatar
                photoUrl={currentPhoto}
                firstName={userInfo.firstName}
                lastName={userInfo.lastName}
                size="md"
              />
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 w-16">No Photo:</span>
              <UserAvatar
                firstName={userInfo.firstName}
                lastName={userInfo.lastName}
                size="md"
              />
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 w-16">Different Sizes:</span>
              <div className="flex space-x-2">
                <UserAvatar
                  firstName={userInfo.firstName}
                  lastName={userInfo.lastName}
                  size="xs"
                />
                <UserAvatar
                  firstName={userInfo.firstName}
                  lastName={userInfo.lastName}
                  size="sm"
                />
                <UserAvatar
                  firstName={userInfo.firstName}
                  lastName={userInfo.lastName}
                  size="md"
                />
                <UserAvatar
                  firstName={userInfo.firstName}
                  lastName={userInfo.lastName}
                  size="lg"
                />
                <UserAvatar
                  firstName={userInfo.firstName}
                  lastName={userInfo.lastName}
                  size="xl"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 w-16">Clickable:</span>
              <UserAvatar
                firstName={userInfo.firstName}
                lastName={userInfo.lastName}
                size="md"
                onClick={() => alert('Avatar clicked!')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">Usage Instructions</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• <strong>UserPhotoUpload:</strong> Use for profile photo management with upload/delete functionality</p>
          <p>• <strong>UserAvatar:</strong> Use for displaying user photos or initials throughout the app</p>
          <p>• Photos are automatically validated for type (JPEG, PNG, WebP) and size (max 5MB)</p>
          <p>• Drag and drop is supported for easy photo upload</p>
          <p>• Fallback to user initials with colored backgrounds when no photo is available</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoExample; 