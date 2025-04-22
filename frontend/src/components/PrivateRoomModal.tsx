import React, { useState } from 'react';
import CreatePrivateRoom from './CreatePrivateRoom';
import JoinPrivateRoom from './JoinPrivateRoom';

interface PrivateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum TabOption {
  JOIN = 'join',
  CREATE = 'create'
}

const PrivateRoomModal: React.FC<PrivateRoomModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabOption>(TabOption.JOIN);

  if (!isOpen) return null;

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-end p-2">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex border-b">
          <button 
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === TabOption.JOIN 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(TabOption.JOIN)}
          >
            Join Private Room
          </button>
          <button 
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === TabOption.CREATE 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(TabOption.CREATE)}
          >
            Create Private Room
          </button>
        </div>
        
        {activeTab === TabOption.JOIN ? (
          <JoinPrivateRoom onClose={onClose} />
        ) : (
          <CreatePrivateRoom onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default PrivateRoomModal;