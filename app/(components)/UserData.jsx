import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

function UserData({ selectedChatRoom  ,userData}) {
  const myData = selectedChatRoom?.myData;
  return (
    <>
      <div className="flex items-center justify-between p-4 py-7  mb-6 border-b ">
        <div className="UserData  flex justify-start items-center ms-2">
          <img
            src={userData?.avatarUrl}
            alt="UserAvatar"
            className="w-14  h-14   rounded-full object-cover  me-4 "
          />
          <h4 className=" font-bold  capitalize">{userData?.name}</h4>
        </div>

        <div className="flex justify-center items-center">
          <FontAwesomeIcon icon={faGear} className=" text-xl  cursor-pointer" />
        </div>
      </div>
    </>
  );
}

export default UserData;
