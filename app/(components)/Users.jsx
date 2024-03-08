

import React, { useState, useEffect } from "react";
import moment from "moment"; 
import UserCard from "./UserCard";
import { Button } from "flowbite-react";
import { firestore, app } from "@/app/Firebase/Firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import UserData from "./UserData";
import { TextInput } from "flowbite-react";

function formatTimeAgo(timestamp) {
  return moment(timestamp).fromNow();
}

function Users({ userData, setSelectedChatRoom }) {
  const [activeTab, setActiveTab] = useState("users");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [users, setUsers] = useState([]);
  const [userChatRooms, setUserChatRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [disabledUsers, setDisabledUsers] = useState([]); 
  const auth = getAuth(app);
  const router = useRouter();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
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

    // Set disabled user IDs
    setDisabledUsers(userIDsInChatrooms);
  }, [userChatRooms]);

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

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    user.name && user.name.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  // Filter chat rooms based on search query
  const filteredChatRooms = userChatRooms.filter((chat) =>
    chat.usersData[
      Object.keys(chat.usersData).find((id) => id !== userData?.id)
    ].name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleUserCardClick = () => {
    if (window.innerWidth < 800 && activeTab === "chatRooms") {
      const element = document.getElementById("users");
      if (element) {
        element.style.display = "none";
      }
      const element1 = document.getElementById("chat");
      if (element1) {
        element1.style.display = "block";
      }
    }
  };

  return (
    <>
      <div
        className="shadow-lg min-h-screen overflow-auto    users "
        id="users"
      >
        <UserData userData={userData} />

        <div className="mx-5">
          <TextInput
            id="search"
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="flex justify-between p-4">
          <Button
            gradientDuoTone={
              activeTab === "users" ? "cyanToBlue" : "purpleToBlue"
            }
            onClick={() => handleTabClick("users")}
          >
            Users
          </Button>
          <Button
            onClick={() => handleTabClick("chatRooms")}
            gradientDuoTone={
              activeTab === "chatRooms" ? "cyanToBlue" : "purpleToBlue"
            }
          >
            Chats
          </Button>
          <Button onClick={handleLogOut}>
            LogOut{" "}
            <FontAwesomeIcon icon={faRightFromBracket} className="ms-2" />
          </Button>
        </div>

        <div>
          {activeTab === "chatRooms" && (
            <>
              <h1 className="px-4 text-base font-bold">Chats</h1>
              {loadingChats ? (
                <LoadingSpinner />
              ) : (
                filteredChatRooms.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      openChat(chat);
                      handleUserCardClick();
                    }}
                    className=" border-b border-gray-200"
                  >
                    <UserCard
                      name={
                        chat.usersData[
                          Object.keys(chat.usersData).find(
                            (id) => id !== userData?.id
                          )
                        ].name
                      }
                      avatarUrl={
                        chat.usersData[
                          Object.keys(chat.usersData).find(
                            (id) => id !== userData?.id
                          )
                        ].avatarUrl
                      }
                      latestMessage={chat.lastMessage}
                      time={
                        chat.timestamp
                          ? formatTimeAgo(chat.timestamp.toDate())
                          : ""
                      }
                      type={"chat"}
                    />
                  </div>
                ))
              )}
            </>
          )}
        </div>

        <div>
          {activeTab === "users" && (
            <>
              <h1 className="px-4 text-base font-bold ">Users</h1>
              {loadingUsers ? (
                <>
                  <LoadingSpinner />
                </>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={
                      !disabledUsers.includes(user.id) &&
                      activeTab === "chatRooms"
                        ? "hidden"
                        : ""
                    } // Hide user card in chatRooms tab if user is not disabled
                  >
                    <div className="flex  w-100  items-center justify-between me-6  border-b border-gray-200">
                      <UserCard
                        key={user.id}
                        name={user.name}
                        type={"users"}
                        avatarUrl={user.avatarUrl}
                      />
                      <Button
                        onClick={() => createChat(user)}
                        outline
                        gradientDuoTone="cyanToBlue"
                        disabled={disabledUsers.includes(user.id)} // Disable button if user ID is in disabledUsers array
                      >
                        Add user
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Users;
