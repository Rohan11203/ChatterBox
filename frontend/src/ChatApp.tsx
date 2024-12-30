import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, Plus } from 'lucide-react';

const ChatApp = () => {
  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Animated gradient backgrounds */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 via-black to-transparent animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-red-500/30 via-black to-transparent animate-pulse"></div>
      
      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center h-full text-white px-4">
        <div className="text-center space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <MessageSquare size={48} className="text-blue-500 animate-bounce" />
          </div>
          
          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent">
              Welcome to ChatSpace
            </h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Connect, collaborate, and communicate in real-time with friends and colleagues
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link 
              to="/join" 
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors duration-200"
            >
              <Users size={20} />
              Join Existing Chat
            </Link>
            
            <Link 
              to="/create" 
              className="flex items-center justify-center gap-2 px-6 py-3 bg-black border border-red-500 hover:bg-red-500/10 rounded-lg font-medium transition-colors duration-200"
            >
              <Plus size={20} />
              Create New Chat
            </Link>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-sm text-gray-400">
            <div className="p-4">
              <h3 className="font-semibold text-white mb-2">Real-time Chat</h3>
              <p>Instant messaging with live updates and notifications</p>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white mb-2">Secure</h3>
              <p>End-to-end encryption for your private conversations</p>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white mb-2">Cross-platform</h3>
              <p>Access your chats from any device, anywhere</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;