import {
  faCircleInfo,
  faPhone,
  faVideo,
  faAngleLeft,
  faCircle,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import React, { useState } from "react";
import moment from "moment";

function ChatRoomHeader({ other }) {
  const [showOptions, setShowOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile view on component mount and window resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleBackIconClick = () => {
    // Updated for consistent mobile handling
    const usersSide = document.getElementById("users-side");
    const chatRoom = document.getElementById("chatRoom");
    const emptyChatRoom = document.getElementById("EmptyChatRoom");
    
    if (usersSide && chatRoom) {
      usersSide.classList.remove("hidden");
      chatRoom.classList.add("hidden");
      if (emptyChatRoom) emptyChatRoom.classList.remove("hidden");
    }
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };
  return (
    <div className="flex items-center justify-between p-2 sm:p-4 bg-white border-b border-gray-200 chat-header">
      {/* Left section with user info */}
      <div className="flex items-center space-x-2 sm:space-x-3">
      <div className="md:hidden flex items-center pl-2 z-[9500]">
          <button 
            id="chat-back-button"
            className=" text-gray-700 hover:text-indigo-600   " 
            onClick={(e) => {
              // Using most direct approach possible with all safety checks
              e.preventDefault();
              e.stopPropagation();
              
              // Force click the chats button in the mobile nav
              const showChatsButton = document.getElementById('show-chats-list-button');
              if (showChatsButton) {
                console.log('Triggering chats button click');
                showChatsButton.click();
                return;
              }
              
              // Fallback to direct DOM manipulation
              const usersSide = document.getElementById("users-side");
              const chatRoom = document.getElementById("chatRoom");
              const emptyChatRoom = document.getElementById("EmptyChatRoom");
              
              // Force display properties first
              if (usersSide) usersSide.style.display = "block";
              if (chatRoom) chatRoom.style.display = "none";
              if (emptyChatRoom) emptyChatRoom.style.display = "flex";
              
              // Then update classes
              if (usersSide) usersSide.classList.remove("hidden");
              if (chatRoom) chatRoom.classList.add("hidden");
              if (emptyChatRoom) emptyChatRoom.classList.remove("hidden");
              
              console.log('Back button direct DOM manipulation complete');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        {/* User avatar with online indicator */}
        <div className="relative">
          {other?.avatarUrl ? (
            <Image
              src={other.avatarUrl}
              alt={other?.name || "User"}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200"
              width={40}
              height={40}
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-gray-200">
              <span className="text-indigo-600 font-semibold text-sm sm:text-base">
                {other?.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          )}

          {/* Online status indicator */}
          <span 
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${other?.isOnline ? 'bg-green-500' : 'bg-gray-300'} border border-white`}
          ></span>
        </div>

        {/* User info */}
        <div className="flex flex-col justify-center overflow-hidden">
          <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-[140px] sm:max-w-full">
            {other?.name || "User"}
          </h4>

          <span className="text-xs text-gray-500 truncate max-w-[140px] sm:max-w-full">
            {other?.isOnline
              ? "Online"
              : other?.lastSeen
              ? `Last seen ${moment(other.lastSeen).fromNow()}`
              : "Offline"}
          </span>
        </div>
      </div>

      {/* Right section with action buttons - hide some on smaller screens */}
      <div className="flex items-center">
        {/* Phone call button - hidden on smallest screens */}
        <button className="hidden xs:block p-2 text-gray-600 hover:text-indigo-600 transition-colors">
          <FontAwesomeIcon icon={faPhone} className="text-lg" />
        </button>

        {/* Video call button - hidden on smallest screens */}
        <button className="hidden sm:block p-2 text-gray-600 hover:text-indigo-600 transition-colors">
          <FontAwesomeIcon icon={faVideo} className="text-lg" />
        </button>

        {/* Options menu */}
        <div className="relative">
          <button
            className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            onClick={toggleOptions}
            aria-label="More options"
          >
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>

          {showOptions && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
              onClick={() => setShowOptions(false)} // Close when an option is clicked
            >
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                View profile
              </button>
              {/* Show these options in the dropdown on mobile */}
              <button className="block xs:hidden w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Call
              </button>
              <button className="block sm:hidden w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Video call
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Clear chat
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
                Block user
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatRoomHeader;
