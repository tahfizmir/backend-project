import React from 'react';
import { useParams } from 'react-router-dom';

const Channel = () => {
  const { username } = useParams();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Channel: @{username}</h1>
        <p className="text-gray-600">Channel page coming soon...</p>
      </div>
    </div>
  );
};

export default Channel; 