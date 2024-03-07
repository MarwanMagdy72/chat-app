import Image from "next/image";
import React from "react";

function UserCard({ name, avatarUrl, latestMessage, time, type }) {
  return (
    <div className="flex items-center p-4  relative hover:cursor-pointer">
      <div className="flex-shrink-0 mr-4 relative">
        <div className="w-12 h-12 rounded-full">
          <Image
            src={avatarUrl}
            alt="avatar"
            className="w-full h-full object-cover"
            width={12}
            height={12}
          />
        </div>
      </div>

  {type === "chat" && (
    <>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold"> {name}</h2>
          <span className="text-xs text-gray-500"> {time} </span>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {latestMessage?.length > 50 ? `${latestMessage.substring(0, 40)}...` : latestMessage}
        </p>
      </div>
    </>
)}

      {type === "users" && (
        <>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold "> {name}</h2>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserCard;
