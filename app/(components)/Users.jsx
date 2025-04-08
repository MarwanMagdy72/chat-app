import React, { useState, useEffect, useRef } from "react";
import moment from "moment"; 
import UserCard from "./UserCard";
import { Button, Avatar, Badge, Spinner, Tooltip, TextInput } from "flowbite-react";
import { firestore, app } from "@/app/Firebase/Firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  getDocs,
  query,
  serverTimestamp,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { 
  faRightFromBracket, 
  faSearch, 
  faUserPlus, 
  faComments, 
  faUsers, 
  faEllipsisVertical,
  faBell,
  faCheckCircle,
  faCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import UserData from "./UserData";
import Image from "next/image";

function formatTimeAgo(timestamp) {
  return moment(timestamp).fromNow();
}

function Users({ userData, setSelectedChatRoom }) {
  const [activeTab, setActiveTab] = useState("chatRooms");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);
  const [users, setUsers] = useState([]);
  const [userChatRooms, setUserChatRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [disabledUsers, setDisabledUsers] = useState([]); 
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [sortOrder, setSortOrder] = useState("recent"); // recent, unread, alphabetical
  const searchInputRef = useRef(null);
  const userOptionsRef = useRef(null);
  const auth = getAuth(app);
  const router = useRouter();

  // Handle clicks outside the user options menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (userOptionsRef.current && !userOptionsRef.current.contains(event.target)) {
        setShowUserOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchQuery(""); // Clear search when switching tabs
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Sort chats based on selected sort order
  const sortChats = (chatRooms) => {
    if (sortOrder === "recent") {
      return [...chatRooms].sort((a, b) => {
        const aDate = a.timestamp?.toDate() || new Date(0);
        const bDate = b.timestamp?.toDate() || new Date(0);
        return bDate - aDate;
      });
    } else if (sortOrder === "unread") {
      return [...chatRooms].sort((a, b) => {
        const aUnread = a.lastMessage?.unread ? 1 : 0;
        const bUnread = b.lastMessage?.unread ? 1 : 0;
        return bUnread - aUnread;
      });
    } else if (sortOrder === "alphabetical") {
      return [...chatRooms].sort((a, b) => {
        const aName = a.usersData[Object.keys(a.usersData).find(id => id !== userData?.id)]?.name || "";
        const bName = b.usersData[Object.keys(b.usersData).find(id => id !== userData?.id)]?.name || "";
        return aName.localeCompare(bName);
      });
    }
    return chatRooms;
  };

  const handleLogOut = () => {
    signOut(auth)
      .then(() => {
        toast.success("Logged out successfully");
        router.push("/login");
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  // Get users chatrooms
  useEffect(() => {
    if (!userData) return;

    const chatroomQuery = query(
      collection(firestore, "chatrooms"),
      where("users", "array-contains", userData.id)
    );

    const unsubscribe = onSnapshot(chatroomQuery, (querySnapshot) => {
      const chatrooms = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserChatRooms(chatrooms);
      setLoadingChats(false);
    });

    return unsubscribe;
  }, [userData]);

  const createChat = async (user) => {
    try {
      const existingChatroomsQuery = query(
        collection(firestore, "chatrooms"),
        where("users", "==", [userData.id, user.id])
      );
      const existingChatroomsSnapshot = await getDocs(existingChatroomsQuery);

      if (existingChatroomsSnapshot.docs.length > 0) {
        alert("Chatroom already exists for these users.");
        toast.error("Chatroom already exists for these users.");
        return;
      }

      const usersData = {
        [userData.id]: userData,
        [user.id]: user,
      };

      const chatRoomData = {
        users: [user.id, userData.id],
        usersData,
        timestamp: serverTimestamp(),
        lastMessage: null,
      };

      await addDoc(collection(firestore, "chatrooms"), chatRoomData);
      setActiveTab("chatRooms");
    } catch (error) {
      console.error("Error creating chatroom:", error);
      toast.error("Failed to create chatroom");
    }
  };

  // Get all users
  useEffect(() => {
    setLoadingUsers(true);
    const unsubscribe = onSnapshot(
      collection(firestore, "users"),
      (querySnapshot) => {
        try {
          const users = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUsers(users.filter((user) => user.id !== userData?.id));
          setLoadingUsers(false);
        } catch (error) {
          console.error("Error fetching users:", error);
          setLoadingUsers(false);
        }
      }
    );
    return unsubscribe;
  }, [userData]);

  useEffect(() => {
    // Extract user IDs from chatrooms
    const userIDsInChatrooms = userChatRooms.flatMap((chat) => chat.users);

    // Set disabled user IDs to avoid creating duplicate chats
    setDisabledUsers(userIDsInChatrooms);
  }, [userChatRooms]);

  // Update online status of user
  useEffect(() => {
    if (!userData?.id) return;
    
    // Update user's online status and last active time
    const updateOnlineStatus = async () => {
      try {
        const userRef = doc(firestore, "users", userData.id);
        await updateDoc(userRef, {
          isOnline: true,
          lastActive: serverTimestamp()
        });
        
        // Set up before unload handler to update offline status
        const handleBeforeUnload = async () => {
          try {
            await updateDoc(userRef, {
              isOnline: false,
              lastActive: serverTimestamp()
            });
          } catch (error) {
            console.error("Error updating offline status:", error);
          }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
      } catch (error) {
        console.error("Error updating online status:", error);
      }
    };
    
    updateOnlineStatus();
  }, [userData]);

  const openChat = (chat) => {
    if (chat && chat.usersData) {
      const otherUserId = chat.users.find((id) => id !== userData?.id);
      const otherUserData = chat.usersData[otherUserId];
      const data = {
        id: chat.id,
        myData: userData,
        otherData: otherUserData,
      };
      const EmptyChatRoom = document.getElementById("EmptyChatRoom");
      if (EmptyChatRoom) {
        EmptyChatRoom.style.display = "none";
      }
      const chatRoom = document.getElementById("chatRoom");
      if (chatRoom) {
        chatRoom.style.display = "block";
      }
      setSelectedChatRoom(data);
    }
  };

  // Filter users with improved search functionality
  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    // Search in name, email and bio if available
    const nameMatch = user.name?.toLowerCase().includes(query) || false;
    const emailMatch = user.email?.toLowerCase().includes(query) || false;
    const bioMatch = user.bio?.toLowerCase().includes(query) || false;
    
    return nameMatch || emailMatch || bioMatch;
  });

  // Sort and filter chat rooms with improved functionality
  const filteredChatRooms = sortChats(userChatRooms.filter((chat) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    
    // Find the other user in the chat
    const otherUserId = Object.keys(chat.usersData).find((id) => id !== userData?.id);
    if (!otherUserId || !chat.usersData[otherUserId]) return false;
    
    const otherUser = chat.usersData[otherUserId];
    
    // Match against user name, last message text, or email
    const nameMatch = otherUser.name?.toLowerCase().includes(query) || false;
    const emailMatch = otherUser.email?.toLowerCase().includes(query) || false;
    const messageMatch = chat.lastMessage?.text?.toLowerCase().includes(query) || false;
    
    return nameMatch || messageMatch || emailMatch;
  }));

  const handleUserCardClick = () => {
    // Improved mobile responsive handling
    if (window.innerWidth < 768) {
      const usersSide = document.getElementById("users-side");
      const chatRoom = document.getElementById("chatRoom");
      const emptyChatRoom = document.getElementById("EmptyChatRoom");
      
      if (usersSide && chatRoom) {
        usersSide.classList.add("hidden");
        chatRoom.classList.remove("hidden");
        if (emptyChatRoom) emptyChatRoom.classList.add("hidden");
      }
    }
  };

  return (
    <div
      className="min-h-screen overflow-hidden border-r border-gray-200 bg-white shadow-sm users-sidebar"
      id="users-section"
    >
      {/* Header with user profile and controls */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-100">
          <div className="flex items-center max-w-[70%]">
            {/* User profile with avatar and info */}
            <div className="flex items-center overflow-hidden">
              <div className="relative mr-2 sm:mr-3 flex-shrink-0">
                {userData?.avatarUrl ? (
                  <Image
                    alt="Profile"
                    src={userData.avatarUrl}
                    width={36}
                    height={36}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-gray-200 shadow-sm">
                    <span className="text-indigo-600 font-semibold">
                      {userData?.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
                {/* Online status indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></span>
              </div>
              
              <div className="overflow-hidden">
                <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                  {userData?.name || "User"}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {userData?.email || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Tooltip content="Notifications">
              <button className="p-1.5 sm:p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100">
                <FontAwesomeIcon icon={faBell} className="text-sm sm:text-base" />
              </button>
            </Tooltip>
            <div className="relative" ref={userOptionsRef}>
              <Tooltip content="Options">
                <button 
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100"
                  onClick={() => setShowUserOptions(!showUserOptions)}
                  aria-label="User options"
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} className="text-sm sm:text-base" />
                </button>
              </Tooltip>
              
              {showUserOptions && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                  onClick={() => setShowUserOptions(false)}
                >
                  <button 
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogOut}
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Search input */}
        <div className="p-2 sm:p-3 border-b border-gray-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-sm" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search chats and users..."
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tab navigation - enhanced for mobile */}
        <div className="flex border-b border-gray-100">
          <button
            className={`flex items-center justify-center flex-1 py-2.5 sm:py-3 font-medium text-xs sm:text-sm transition-colors ${activeTab === "chatRooms" ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            onClick={() => handleTabClick("chatRooms")}
            aria-label="Show chats"
          >
            <FontAwesomeIcon icon={faComments} className="mr-1.5 sm:mr-2" />
            <span>Chats</span>
          </button>
          <button
            className={`flex items-center justify-center flex-1 py-2.5 sm:py-3 font-medium text-xs sm:text-sm transition-colors ${activeTab === "users" ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
            onClick={() => handleTabClick("users")}
            aria-label="Show users"
          >
            <FontAwesomeIcon icon={faUsers} className="mr-1.5 sm:mr-2" />
            <span>Users</span>
          </button>
        </div>
      </div>

      {/* Tab content - scrollable area with responsive height */}
      <div 
        className="overflow-y-auto custom-scrollbar -webkit-overflow-scrolling-touch"
        style={{ height: 'calc(100vh - 180px)', maxHeight: 'calc(100% - 180px)' }}
      >
        {/* Chats tab */}
        {activeTab === "chatRooms" && (
          <div className="divide-y divide-gray-100">
            {loadingChats ? (
              <div className="flex justify-center items-center h-32">
                <Spinner size="lg" color="purple" />
              </div>
            ) : filteredChatRooms.length > 0 ? (
              filteredChatRooms.map((chat) => {
                const otherUserId = Object.keys(chat.usersData).find(
                  (id) => id !== userData?.id
                );
                const otherUser = chat.usersData[otherUserId];
                const isUnread = chat.lastMessage?.unread;
                
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      openChat(chat);
                      handleUserCardClick();
                    }}
                    className={`p-2 cursor-pointer transition-colors hover:bg-gray-50 ${isUnread ? 'bg-indigo-50' : ''}`}
                  >
                    <UserCard
                      name={otherUser.name}
                      avatarUrl={otherUser.avatarUrl}
                      latestMessage={chat.lastMessage}
                      time={chat.timestamp ? formatTimeAgo(chat.timestamp.toDate()) : ""}
                      type={"chat"}
                      isOnline={otherUser.isOnline}
                    />
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <p>No chats found</p>
                <p className="text-sm mt-1">Try adding a new user to chat with</p>
              </div>
            )}
          </div>
        )}

        {/* Users tab */}
        {activeTab === "users" && (
          <div className="divide-y divide-gray-100">
            {loadingUsers ? (
              <div className="flex justify-center items-center h-32">
                <Spinner size="lg" color="purple" />
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="p-2 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-grow">
                      <UserCard
                        name={user.name}
                        type={"users"}
                        avatarUrl={user.avatarUrl}
                        isOnline={user.isOnline}
                      />
                    </div>
                    <button
                      onClick={() => createChat(user)}
                      disabled={disabledUsers.includes(user.id)}
                      className={`ml-2 p-2 rounded-full ${disabledUsers.includes(user.id) 
                        ? 'text-gray-400 bg-gray-100' 
                        : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                      title={disabledUsers.includes(user.id) ? "Chat already exists" : "Start chatting"}
                    >
                      <FontAwesomeIcon 
                        icon={disabledUsers.includes(user.id) ? faCheckCircle : faUserPlus} 
                        className="w-4 h-4" 
                      />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <p>No users found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Sort options for chat view */}
      {activeTab === "chatRooms" && !loadingChats && filteredChatRooms.length > 0 && (
        <div className="border-t border-gray-100 p-2 bg-white">
          <div className="flex justify-between items-center text-xs text-gray-500 px-2">
            <span>Sort by:</span>
            <div className="flex space-x-2">
              <button 
                className={`px-2 py-1 rounded ${sortOrder === 'recent' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
                onClick={() => setSortOrder('recent')}
              >
                Recent
              </button>
              <button 
                className={`px-2 py-1 rounded ${sortOrder === 'unread' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
                onClick={() => setSortOrder('unread')}
              >
                Unread
              </button>
              <button 
                className={`px-2 py-1 rounded ${sortOrder === 'alphabetical' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
                onClick={() => setSortOrder('alphabetical')}
              >
                A-Z
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
