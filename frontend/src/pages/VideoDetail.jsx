import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaThumbsUp, FaShare, FaPlus } from 'react-icons/fa';
import { fetchVideoById, likeVideo, subscribeToChannel } from '../store/slices/videoSlice';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from '../components/CommentSection';

const VideoDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentVideo, loading, error } = useSelector((state) => state.video);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchVideoById(id));
    }
  }, [dispatch, id]);

  const handleLike = () => {
    if (isAuthenticated && currentVideo) {
      dispatch(likeVideo(currentVideo._id));
    }
  };

  const handleSubscribe = () => {
    if (isAuthenticated && currentVideo) {
      dispatch(subscribeToChannel(currentVideo.owner._id));
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatSubscribers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !currentVideo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Video not found</h2>
          <p className="text-gray-600">{error || 'The video you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <div className="bg-black rounded-lg overflow-hidden mb-4">
            <video
              src={currentVideo.videoFile}
              controls
              className="w-full video-player"
              poster={currentVideo.thumbnail}
            />
          </div>

          {/* Video Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {currentVideo.title}
            </h1>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-sm text-gray-600 space-x-4">
                <span>{formatViews(currentVideo.views)} views</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(currentVideo.createdAt), { addSuffix: true })}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    currentVideo.isLiked
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FaThumbsUp />
                  <span>{currentVideo.likesCount}</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                  <FaShare />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Channel Info */}
            <div className="flex items-center justify-between py-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <img
                  src={currentVideo.owner.avatar}
                  alt={currentVideo.owner.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {currentVideo.owner.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatSubscribers(currentVideo.owner.subscribersCount)} subscribers
                  </p>
                </div>
              </div>
              
              {isAuthenticated && (
                <button
                  onClick={handleSubscribe}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-full font-medium transition-colors ${
                    currentVideo.owner.isSubscribed
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {!currentVideo.owner.isSubscribed && <FaPlus />}
                  <span>{currentVideo.owner.isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                </button>
              )}
            </div>

            {/* Description */}
            <div className="mt-4">
              <div className={`text-gray-700 ${showFullDescription ? '' : 'line-clamp-3'}`}>
                {currentVideo.description}
              </div>
              {currentVideo.description.length > 200 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8">
            <CommentSection videoId={currentVideo._id} />
          </div>
        </div>

        {/* Sidebar - Related Videos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Related Videos</h3>
            <p className="text-gray-600 text-sm">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail; 