import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { FaThumbsUp, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const CommentSection = ({ videoId }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/comments/${videoId}`, {
        withCredentials: true
      });
      setComments(response.data.data.docs || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/comments/${videoId}`,
        { content: newComment },
        { withCredentials: true }
      );
      
      const commentWithUser = {
        ...response.data.data,
        owner: {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar
        },
        likesCount: 0,
        isLiked: false
      };
      
      setComments([commentWithUser, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/comments/c/${commentId}`,
        { content: editText },
        { withCredentials: true }
      );
      
      setComments(comments.map(comment => 
        comment._id === commentId 
          ? { ...comment, content: response.data.data.content }
          : comment
      ));
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/comments/c/${commentId}`, {
        withCredentials: true
      });
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/likes/toggle/c/${commentId}`,
        {},
        { withCredentials: true }
      );
      
      setComments(comments.map(comment => 
        comment._id === commentId
          ? {
              ...comment,
              isLiked: response.data.data.isLiked,
              likesCount: response.data.data.isLiked
                ? comment.likesCount + 1
                : comment.likesCount - 1
            }
          : comment
      ));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex space-x-3">
            <img
              src={user?.avatar}
              alt={user?.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows="3"
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">Sign in to add a comment</p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex space-x-3">
              <img
                src={comment.owner.avatar}
                alt={comment.owner.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {comment.owner.fullName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                {editingComment === comment._id ? (
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows="2"
                    />
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        onClick={() => {
                          setEditingComment(null);
                          setEditText('');
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditComment(comment._id)}
                        className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                )}
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLikeComment(comment._id)}
                    className={`flex items-center space-x-1 text-sm ${
                      comment.isLiked ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FaThumbsUp size={12} />
                    <span>{comment.likesCount}</span>
                  </button>
                  
                  {isAuthenticated && user?._id === comment.owner._id && (
                    <>
                      <button
                        onClick={() => {
                          setEditingComment(comment._id);
                          setEditText(comment.content);
                        }}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        <FaEdit size={12} />
                        <span>Edit</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={12} />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {comments.length === 0 && (
            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection; 