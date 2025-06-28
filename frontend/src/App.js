import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VideoDetail from './pages/VideoDetail';
import Channel from './pages/Channel';
import UploadVideo from './pages/UploadVideo';
import Profile from './pages/Profile';
import WatchHistory from './pages/WatchHistory';
import LikedVideos from './pages/LikedVideos';
import Subscriptions from './pages/Subscriptions';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/video/:id" element={<VideoDetail />} />
              <Route path="/channel/:username" element={<Channel />} />
              
              {/* Protected Routes */}
              <Route path="/upload" element={
                <ProtectedRoute>
                  <UploadVideo />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/history" element={
                <ProtectedRoute>
                  <WatchHistory />
                </ProtectedRoute>
              } />
              
              <Route path="/liked" element={
                <ProtectedRoute>
                  <LikedVideos />
                </ProtectedRoute>
              } />
              
              <Route path="/subscriptions" element={
                <ProtectedRoute>
                  <Subscriptions />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
