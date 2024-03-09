import React, { useEffect, useRef, useState } from "react";
import MessageCard from "./MessageCard";
import MessageInput from "./MessageInput";
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
} from "firebase/firestore";
import { firestore } from "../Firebase/Firebase";

import ChatRoomHeader from './ChatRoomHeader'

function ChatRoom({ selectedChatRoom }) {
  const me = selectedChatRoom?.myData;
  const other = selectedChatRoom?.otherData;
  const chatRoomId = selectedChatRoom?.id;

  const [message, setMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (!chatRoomId) {
      return;
    }

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
      }
    );

    return unsubscribe;
  }, [chatRoomId]);

  const sendMessage = async (e) => {
    const messageCollection = collection(firestore, "messages");
    if (message.trim() === " " && !image) {
      return;
    }
    try {
      const messageData = {
        chatRoomId,
        senderId: me.id,
        content: message,
        time: serverTimestamp(),
        image: image,
        messageType: "text",
      };
      await addDoc(messageCollection, messageData);
      setMessage(" ");

      const chatRoomRef = doc(firestore, "chatrooms", chatRoomId);
      await updateDoc(chatRoomRef, {
        lastMessage: message ? message : 'Image',
      });

    } catch (err) {
      console.log("Error in sending your message", err);
    }
  };

  return (
    <>
<div className="flex flex-col max-h-screen    " id="chat">
  {/* Header */}
  <div className="sticky top-0 bg-white">
    <ChatRoomHeader other={other} />
  </div>

  {/* Messages */}
  <div className="overflow-y-auto flex-grow  pt-5 message-card">
    {messages?.map((message) => (
      <MessageCard
        key={message.id}
        message={message}
        me={me}
        other={other}
      />
    ))}
    <div ref={messagesContainerRef}></div>
  </div>

  {/* Input */}
  <div className=" bg-white">
    <MessageInput
      sendMessage={sendMessage}
      message={message}
      setMessage={setMessage}
      image={image}
      setImage={setImage}
    />
  </div>
</div>

    </>
  );
}

export default ChatRoom;
