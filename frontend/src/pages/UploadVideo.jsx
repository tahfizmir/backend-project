import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uploadVideo, resetUploadProgress } from '../store/slices/videoSlice';
import { FaUpload, FaVideo, FaImage } from 'react-icons/fa';

const UploadVideo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, uploadProgress } = useSelector((state) => state.video);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  const watchVideo = watch('videoFile');
  const watchThumbnail = watch('thumbnail');

  React.useEffect(() => {
    if (watchVideo && watchVideo[0]) {
      const file = watchVideo[0];
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      
      return () => URL.revokeObjectURL(url);
    }
  }, [watchVideo]);

  React.useEffect(() => {
    if (watchThumbnail && watchThumbnail[0]) {
      const file = watchThumbnail[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [watchThumbnail]);

  React.useEffect(() => {
    return () => {
      dispatch(resetUploadProgress());
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    const formData = {
      title: data.title,
      description: data.description,
      videoFile: data.videoFile[0],
      thumbnail: data.thumbnail[0]
    };

    const result = await dispatch(uploadVideo(formData));
    
    if (uploadVideo.fulfilled.match(result)) {
      reset();
      setVideoPreview(null);
      setThumbnailPreview(null);
      navigate('/');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <FaUpload className="text-primary-600 mr-3" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Upload Video</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Video File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                {...register('videoFile', { required: 'Video file is required' })}
                type="file"
                accept="video/*"
                className="hidden"
                id="videoFile"
              />
              <label htmlFor="videoFile" className="cursor-pointer">
                {videoPreview ? (
                  <div className="space-y-2">
                    <video
                      src={videoPreview}
                      controls
                      className="mx-auto max-w-full h-48 rounded-lg"
                    />
                    <p className="text-sm text-gray-600">Click to change video</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FaVideo className="mx-auto text-gray-400" size={48} />
                    <p className="text-gray-600">Click to select video file</p>
                    <p className="text-sm text-gray-500">MP4, WebM, or OGV (max 100MB)</p>
                  </div>
                )}
              </label>
            </div>
            {errors.videoFile && (
              <p className="mt-1 text-sm text-red-600">{errors.videoFile.message}</p>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                {...register('thumbnail', { required: 'Thumbnail is required' })}
                type="file"
                accept="image/*"
                className="hidden"
                id="thumbnail"
              />
              <label htmlFor="thumbnail" className="cursor-pointer">
                {thumbnailPreview ? (
                  <div className="space-y-2">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="mx-auto max-w-full h-32 object-cover rounded-lg"
                    />
                    <p className="text-sm text-gray-600">Click to change thumbnail</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FaImage className="mx-auto text-gray-400" size={48} />
                    <p className="text-gray-600">Click to select thumbnail</p>
                    <p className="text-sm text-gray-500">PNG, JPG, or GIF (max 5MB)</p>
                  </div>
                )}
              </label>
            </div>
            {errors.thumbnail && (
              <p className="mt-1 text-sm text-red-600">{errors.thumbnail.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              {...register('title', { 
                required: 'Title is required',
                maxLength: {
                  value: 100,
                  message: 'Title must be less than 100 characters'
                }
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter video title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description', { 
                required: 'Description is required',
                maxLength: {
                  value: 500,
                  message: 'Description must be less than 500 characters'
                }
              })}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Tell viewers about your video"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                'Upload Video'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo; 