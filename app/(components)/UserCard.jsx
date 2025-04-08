import Image from "next/image";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faImage } from "@fortawesome/free-solid-svg-icons";

function UserCard({ name, avatarUrl, latestMessage, time, type, isOnline }) {
  return (
    <div className="flex items-center p-2 sm:p-3 relative hover:cursor-pointer transition-colors hover:bg-gray-50 rounded-md">
      {/* User avatar with online status indicator */}
      <div className="flex-shrink-0 mr-3 relative">
        {avatarUrl ? (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm">
            <Image
              src={avatarUrl}
              alt={name || "User"}
              className="w-full h-full object-cover"
              width={48}
              height={48}
            />
          </div>
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-100 flex items-center justify-center border border-gray-200 shadow-sm">
            <span className="text-indigo-600 font-medium text-base sm:text-lg">{name?.charAt(0)?.toUpperCase() || "?"}</span>
          </div>
        )}
        
        {/* Online status indicator */}
        {isOnline !== undefined && (
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
        )}
      </div>

      {/* Chat content */}
      {type === "chat" && (
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-0.5">
            <h2 className="text-base sm:text-lg font-medium text-gray-800 truncate pr-2">{name}</h2>
            <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">{time}</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            {typeof latestMessage === 'object' ? (
              latestMessage?.image ? (
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faImage} className="mr-1 text-gray-400" />
                  {latestMessage?.text ? latestMessage.text : "Image"}
                </span>
              ) : (
                latestMessage?.text || "No messages yet"
              )
            ) : (
              latestMessage || "No messages yet"
            )}
          </p>
        </div>
      )}

      {/* User info for users list */}
      {type === "users" && (
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-medium text-gray-800 truncate">{name}</h2>
          </div>
          {isOnline !== undefined && (
            <p className="text-xs sm:text-sm text-gray-500">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default UserCard;
