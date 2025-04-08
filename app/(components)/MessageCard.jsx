import moment from "moment";
import Image from "next/image";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCheckDouble } from "@fortawesome/free-solid-svg-icons";

function MessageCard({ message, me, other }) {
  const isMessageFromMe = message.senderId === me.id;
  
  // Format message timestamp
  const formatMessageTime = (time) => {
    if (!time) return "";
    
    const date = time?.toDate ? time.toDate() : new Date(time);
    const now = new Date();
    const momentDate = moment(date);
    
    // If the message is from today, just show the time
    if (momentDate.isSame(now, 'day')) {
      return momentDate.format('h:mm A');
    }
    
    // If the message is from yesterday, show "Yesterday" and time
    if (momentDate.isSame(moment(now).subtract(1, 'days'), 'day')) {
      return `Yesterday at ${momentDate.format('h:mm A')}`;
    }
    
    // If the message is from this week, show the day and time
    if (momentDate.isAfter(moment(now).subtract(7, 'days'))) {
      return momentDate.format('ddd [at] h:mm A');
    }
    
    // Otherwise show the date and time
    return momentDate.format('MMM D [at] h:mm A');
  };
  
  return (
    <div className={`flex ${isMessageFromMe ? "justify-end" : "justify-start"} mb-3`}>
      {/* Message container with avatar and bubble */}
      <div className={`flex max-w-[85%] ${isMessageFromMe ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        {!isMessageFromMe && (
          <div className="flex-shrink-0 mr-2">
            {other.avatarUrl ? (
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  width={32}
                  height={32}
                  src={other.avatarUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">
                  {other?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Message bubble */}
        <div
          className={`relative ${isMessageFromMe ? "mr-2" : "ml-0"}`}
        >
          <div 
            className={`p-3 rounded-lg ${
              isMessageFromMe 
                ? "message-bubble-sent bg-indigo-600 text-white" 
                : "message-bubble-received bg-gray-100 text-gray-800"
            } shadow-sm`}
          >
            {/* Image (if present) */}
            {message.image && (
              <div className="mb-2 overflow-hidden rounded-md">
                <Image
                  width={300}
                  height={300}
                  className="w-full h-auto object-cover rounded-md"
                  src={message.image}
                  alt="Message attachment"
                />
              </div>
            )}
            
            {/* Message text */}
            {message.content && message.content.trim() !== "" && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
            
            {/* Time and read status */}
            <div className={`flex items-center mt-1 text-xs ${isMessageFromMe ? "text-indigo-100" : "text-gray-500"} justify-end space-x-1`}>
              <span>{formatMessageTime(message.time)}</span>
              
              {/* Show read status only for sent messages */}
              {isMessageFromMe && (
                <span className="ml-1">
                  {message.read ? (
                    <FontAwesomeIcon icon={faCheckDouble} className="text-blue-300" />
                  ) : (
                    <FontAwesomeIcon icon={faCheck} />
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Sender avatar for sent messages (optional, can be removed) */}
        {false && isMessageFromMe && (
          <div className="flex-shrink-0 ml-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Image
                width={32}
                height={32}
                src={me.avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageCard;
