import React, { useEffect, useRef, useState } from "react";
import MessageCard from "./MessageCard";
import MessageInput from "./MessageInput";
import LoadingSpinner from "./LoadingSpinner";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../Firebase/Firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faCheck, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import moment from "moment";

import ChatRoomHeader from './ChatRoomHeader'

function ChatRoom({ selectedChatRoom }) {
  const me = selectedChatRoom?.myData;
  const other = selectedChatRoom?.otherData;
  const chatRoomId = selectedChatRoom?.id;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupedMessages, setGroupedMessages] = useState({});
  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);

  // Group messages by date for better UI organization
  useEffect(() => {
    const grouped = {};
    messages.forEach(msg => {
      const date = msg.time ? moment(msg.time.toDate()).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });
    setGroupedMessages(grouped);
  }, [messages]);

  // Fetch messages
  useEffect(() => {
    if (!chatRoomId) {
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      query(
        collection(firestore, "messages"),
        where("chatRoomId", "==", chatRoomId),
        orderBy("time", "asc")
      ),
      (snapshot) => {
        const messageData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messageData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching messages:", error);
        toast.error("Could not load messages");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [chatRoomId]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Format the date display
  const formatDate = (dateStr) => {
    const date = moment(dateStr, 'YYYY-MM-DD');
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');
    
    if (date.isSame(today, 'd')) {
      return 'Today';
    } else if (date.isSame(yesterday, 'd')) {
      return 'Yesterday';
    } else {
      return date.format('MMMM D, YYYY');
    }
  };

  const sendMessage = async (e) => {
    const messageCollection = collection(firestore, "messages");
    if ((message.trim() === "" || message.trim() === " ") && !image) {
      return;
    }
    
    try {
      // Show sending indicator
      const sendingToast = toast.loading("Sending...");
      
      const messageData = {
        chatRoomId,
        senderId: me.id,
        content: message,
        time: serverTimestamp(),
        image: image,
        messageType: image ? "image" : "text",
        read: false
      };
      
      await addDoc(messageCollection, messageData);
      setMessage("");
      setImage(null);

      const chatRoomRef = doc(firestore, "chatrooms", chatRoomId);
      await updateDoc(chatRoomRef, {
        lastMessage: message ? message : 'Image',
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: me.id,
        unread: true
      });
      
      // Dismiss the sending indicator with success
      toast.dismiss(sendingToast);
      
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-full md:h-screen bg-gray-50" id="chat">
      {/* Header with back button for mobile */}
      <div className="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-10">
        
        <ChatRoomHeader other={other} />
      </div>

      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Messages - adjusted for mobile */}
          <div 
            className="overflow-y-auto flex-grow p-2 sm:p-4 message-card pb-32 md:pb-4" 
            ref={messagesContainerRef}
            style={{ height: "calc(100% - 130px)", paddingBottom: '120px' }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="p-4 sm:p-8 rounded-lg text-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-indigo-300 text-2xl sm:text-4xl mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">No messages yet</h3>
                  <p className="text-sm sm:text-base text-gray-500">Start the conversation by sending a message!</p>
                </div>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className="mb-3 sm:mb-4">
                  {/* Date separator */}
                  <div className="flex justify-center my-2 sm:my-3">
                    <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {formatDate(date)}
                    </div>
                  </div>
                  
                  {/* Messages for this date */}
                  {dateMessages.map((message, index) => {
                    const isLastMessage = index === dateMessages.length - 1 && 
                                        date === Object.keys(groupedMessages)[Object.keys(groupedMessages).length - 1];
                    return (
                      <div 
                        key={message.id} 
                        ref={isLastMessage ? lastMessageRef : null}
                        className="mb-2 sm:mb-3 fade-in"
                      >
                        <MessageCard
                          message={message}
                          me={me}
                          other={other}
                        />
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Input - fixed to bottom on mobile with higher z-index */}
          <div 
            className="bg-white border-t border-gray-200 shadow-lg message-input fixed bottom-0 left-0 right-0 md:static pt-2" 
            style={{ 
              zIndex: 9999, 
              paddingBottom: 'calc(1rem + 80px)',
              marginBottom: '-70px'
            }}
          >
            <MessageInput
              sendMessage={sendMessage}
              message={message}
              setMessage={setMessage}
              image={image}
              setImage={setImage}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ChatRoom;
