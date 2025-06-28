import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Async thunks
export const fetchVideos = createAsyncThunk(
  'video/fetchVideos',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/videos`, {
        params,
        withCredentials: true
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchVideoById = createAsyncThunk(
  'video/fetchVideoById',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/videos/${videoId}`, {
        withCredentials: true
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const uploadVideo = createAsyncThunk(
  'video/upload',
  async (videoData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(videoData).forEach(key => {
        formData.append(key, videoData[key]);
      });
      
      const response = await axios.post(`${API_BASE_URL}/videos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const likeVideo = createAsyncThunk(
  'video/like',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/likes/toggle/v/${videoId}`, {}, {
        withCredentials: true
      });
      return { videoId, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const subscribeToChannel = createAsyncThunk(
  'video/subscribe',
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/subscriptions/c/${channelId}`, {}, {
        withCredentials: true
      });
      return { channelId, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const videoSlice = createSlice({
  name: 'video',
  initialState: {
    videos: [],
    currentVideo: null,
    loading: false,
    error: null,
    uploadProgress: 0,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch videos
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload.docs || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch video by ID
      .addCase(fetchVideoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVideo = action.payload;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload video
      .addCase(uploadVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.videos.unshift(action.payload);
        state.uploadProgress = 0;
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      })
      
      // Like video
      .addCase(likeVideo.fulfilled, (state, action) => {
        if (state.currentVideo && state.currentVideo._id === action.payload.videoId) {
          state.currentVideo.isLiked = action.payload.isLiked;
          state.currentVideo.likesCount = action.payload.isLiked 
            ? state.currentVideo.likesCount + 1 
            : state.currentVideo.likesCount - 1;
        }
      })
      
      // Subscribe to channel
      .addCase(subscribeToChannel.fulfilled, (state, action) => {
        if (state.currentVideo && state.currentVideo.owner._id === action.payload.channelId) {
          state.currentVideo.owner.isSubscribed = action.payload.subscribed;
          state.currentVideo.owner.subscribersCount = action.payload.subscribed
            ? state.currentVideo.owner.subscribersCount + 1
            : state.currentVideo.owner.subscribersCount - 1;
        }
      });
  },
});

export const { clearError, resetUploadProgress, clearCurrentVideo } = videoSlice.actions;
export default videoSlice.reducer; 