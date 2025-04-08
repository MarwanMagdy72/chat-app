"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { app, firestore } from "./Firebase/Firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import Users from "./(components)/Users";
import ChatRoom from "./(components)/ChatRoom";
import LoadingSpinner from "./(components)/LoadingSpinner";
import { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";

function Home() {
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          const userRef = doc(firestore, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = { id: userSnap.id, ...userSnap.data() };
            setUser(userData);
          } else {
            console.error("No user document found!");
            router.push("/login");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unSubscribe();
  }, [auth, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50">
      {/* Toast notifications */}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      
      {/* Mobile navigation bar - enhanced and fixed for better UX */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[9000] flex justify-around items-center h-16 px-2 shadow-md safe-area-bottom">
        <button 
          id="show-chats-list-button"
          className="p-3 flex flex-col items-center justify-center focus:outline-none text-gray-600 hover:text-indigo-600 transition-colors relative flex-1 active:bg-gray-100 rounded-md"
          onClick={(e) => {
            e.preventDefault();
            console.log('Show chats list button clicked');
            
            // More direct approach with style manipulation
            const usersEl = document.getElementById('users-side');
            const chatRoomEl = document.getElementById('chatRoom');
            const emptyChatEl = document.getElementById('EmptyChatRoom');
            
            // First set display property directly
            if (usersEl) usersEl.style.display = 'block';
            if (chatRoomEl) chatRoomEl.style.display = 'none';
            if (emptyChatEl) emptyChatEl.style.display = 'flex';
            
            // Then handle classes
            if (usersEl) usersEl.classList.remove('hidden');
            if (chatRoomEl) chatRoomEl.classList.add('hidden');
            if (emptyChatEl) emptyChatEl.classList.remove('hidden');
          }}
          aria-label="Show chats list"
        >
          <FontAwesomeIcon icon={faComments} className="h-5 w-5" />
          <span className="block text-xs mt-1 font-medium">Chats</span>
        </button>
        
        {selectedChatRoom && (
          <button 
            id="show-current-chat-button"
            className="p-3 flex flex-col items-center justify-center focus:outline-none text-gray-600 hover:text-indigo-600 transition-colors relative flex-1 active:bg-gray-100 rounded-md"
            onClick={(e) => {
              e.preventDefault();
              console.log('Show current chat button clicked');
              
              // More direct approach with style manipulation
              const usersEl = document.getElementById('users-side');
              const chatRoomEl = document.getElementById('chatRoom');
              const emptyChatEl = document.getElementById('EmptyChatRoom');
              
              // First set display property directly
              if (usersEl) usersEl.style.display = 'none';
              if (chatRoomEl) chatRoomEl.style.display = 'block';
              if (emptyChatEl) emptyChatEl.style.display = 'none';
              
              // Then handle classes
              if (usersEl) usersEl.classList.add('hidden');
              if (chatRoomEl) chatRoomEl.classList.remove('hidden');
              if (emptyChatEl) emptyChatEl.classList.add('hidden');
            }}
            aria-label="Show current chat"
          >
            <div className="relative">
              {/* Active chat indicator */}
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="block text-xs mt-1 font-medium">Current Chat</span>
          </button>
        )}
      </div>
      
      {/* Users sidebar - adjusted for mobile */}
      <aside 
        className="w-full md:w-80 bg-white border-r border-gray-200 md:overflow-y-visible overflow-hidden md:flex-shrink-0 md:h-screen h-[calc(100vh-64px)]"
        id="users-side"
      >
        <Users 
          userData={user} 
          selectedChatRoom={selectedChatRoom} 
          setSelectedChatRoom={setSelectedChatRoom} 
        />
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col w-full">
        {/* Empty state - hidden on mobile but visible on desktop */}
        <div 
          className="flex-grow md:flex hidden items-center justify-center bg-gray-50 w-full h-full"
          id="EmptyChatRoom"
        >
          <div className="text-center p-4 sm:p-8 max-w-md mx-auto">
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-full bg-indigo-100 mb-4 shadow-md">
              <FontAwesomeIcon icon={faComments} className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No conversation selected</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">Choose a contact from the list to start messaging</p>
            <div className="block">
              <button 
                onClick={() => {
                  const usersSideTab = document.getElementById('users-section');
                  const usersTab = usersSideTab?.querySelector('button:nth-child(2)');
                  if (usersTab) usersTab.click();
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Find someone to chat with
              </button>
            </div>
          </div>
        </div>
        
        {/* Chat room - fixed positioning for mobile */}
        <div 
          className="flex-grow hidden w-full h-full md:h-screen fixed md:static inset-0 z-[8000] md:z-auto bg-gray-50"
          id="chatRoom"
          style={{ paddingBottom: '80px' }}
        >
          <ChatRoom user={user} selectedChatRoom={selectedChatRoom} />
        </div>
      </main>
    </div>
  );
}

export default Home;
