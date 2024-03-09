"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { app, firestore } from "./Firebase/Firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import Users from "./(components)/Users";

import ChatRoom from "./(components)/ChatRoom";

function Home() {
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const router = useRouter();


  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(firestore, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = ({id: userSnap.id , ...userSnap.data()})
        setUser(userData);
      } else {
        setUser(null);
        router.push("/login");
      }
    });
    return () => unSubscribe();
  }, [auth, router]);

  return (
    
    <>
      <div className="  flex   flex-wrap">
        {/* Left */}
        <div className="flex-shrink-0 w-3/12 users-side max-h-screen overflow-y-auto" id='users-side'>
  <Users userData={user} selectedChatRoom={selectedChatRoom} setSelectedChatRoom={setSelectedChatRoom} />
</div>

        {/* Right */}
        <div className="flex-grow w-3/12 flex items-center justify-center bg-gray-200 max-h-screen "  id="EmptyChatRoom">
          {" "}
          <h3 className=' shadow-lg p-5 rounded-full bg-gray-300'> Select a chat to start messaging  </h3>
          
        </div>
        <div className="flex-grow w-3/12 chatRoom-side hidden max-h-screen"  id="chatRoom">
          {" "}
          <ChatRoom user={user}   selectedChatRoom={selectedChatRoom}/>{" "}

        </div>
      </div>
    </>
  );
}

export default Home;
