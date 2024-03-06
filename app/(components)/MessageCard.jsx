import moment from "moment";
import React from "react";

function MessageCard({ message, me, other }) {
  const isMessageFromMe = message.senderId === me.id;
  const timeAgo = (time) => {
    const date = time?.toDate();
    const momentDate = moment(date);
    return momentDate.fromNow();
  };
  return (
    <>
    
    
    <div
      key={message.id}
      className={`flex lg:mx-4  ${isMessageFromMe ? "justify-end " : "justify-start"}`}
    >
      
      <div
        className={`  flex  mb-4 ${
          isMessageFromMe ? "ml-2 mr-2 flex-row-reverse   " : "mr-2"
        }`}
      >
        {/* Handle Avatar Position */}

        {
          !isMessageFromMe &&(
            <img
              src={other.avatarUrl}
              alt="avatar"
              className={` w-10 h-10 rounded-full object-cover me-2 ms-2`}
            />

          )
        }
        {
          isMessageFromMe &&(
            <img
              src={me.avatarUrl}
              alt="avatar"
              className={` rounded-full object-cover w-10 h-10  ms-2 `}
            />

          )
        }
        {/* Handle Message Position */}

        <div
          className={`text-white p-2 rounded-md ${
            isMessageFromMe
              ? "bg-slate-500  self-start "
              : "bg-cyan-950 self-start"
          }`}
          style={{ minWidth: "200px"  , maxWidth:'400px' }}
        >
          {
            message.image&&(
              <img className='w-60 h-60  mb-2 object-cover rounded-md'
              src={message.image}
              alt='Message'
              />
            )
          }
          <p>{message.content}</p>
          <span className="text-xs text-gray-300">{timeAgo(message.time)}</span>
        </div>
      </div>
    </div>
    </>
  );
}

export default MessageCard;
