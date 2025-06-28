import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const VideoCard = ({ video }) => {
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/video/${video._id}`}>
        <div className="relative">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/video/${video._id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600">
            {video.title}
          </h3>
        </Link>
        
        <Link to={`/channel/${video.owner.username}`}>
          <div className="flex items-center mb-2">
            <img
              src={video.owner.avatar}
              alt={video.owner.fullName}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-sm text-gray-600 hover:text-gray-900">
              {video.owner.fullName}
            </span>
          </div>
        </Link>
        
        <div className="flex items-center text-sm text-gray-500 space-x-2">
          <span>{formatViews(video.views)} views</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard; 