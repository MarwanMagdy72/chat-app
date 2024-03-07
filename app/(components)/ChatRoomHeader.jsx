import {
  faCircleInfo,
  faPhone,
  faVideo,
  faAngleLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import React from "react";

function ChatRoomHeader({other}) {

  const handleBackIconClick = () => {
    if (window.innerWidth < 800 ) {
     
      const element1 = document.getElementById("chat");
      if (element1) {
        element1.style.display = "none";
      }
      const element2 = document.getElementById("users");
      if (element2) {
        element2.style.display = "block";
      }
    }
  };
  return (
    <>
      <div className="flex items-center justify-between  border-b  p-7  bg-gray-100 shadow-md sticky top-0 left-0 right-0 w-100" >
      <div className="UserData flex justify-start items-center">
  <FontAwesomeIcon icon={faAngleLeft} className='me-4 text-3xl text-blue-600 back-icon hidden cursor-pointer' onClick={() => handleBackIconClick()} />
  <Image
    src={other?.avatarUrl}
    alt="UserAvatar"
    className="w-14 h-14 rounded-full object-cover me-4"
    width={14}
    height={14}
  />
  <h4 className="font-bold text-xl ">
    {/* Truncate name on screens smaller than md (tailwind class: md:hidden) */}
    <span className="hidden md:inline">
      {other?.name}
    </span>
    <span className="md:hidden">
    {other?.name.length > 12 ? other?.name.substring(0, 12) + '...' : other?.name}
    </span>
  </h4>
</div>


        <div className="flex justify-end items-center">
          <FontAwesomeIcon icon={faPhone}  className=' text-xl text-blue-600 cursor-pointer '/>
          <FontAwesomeIcon className="mx-4 text-xl text-blue-600 cursor-pointer" icon={faVideo}  />
          <FontAwesomeIcon icon={faCircleInfo}  className=' text-xl text-blue-600  cursor-pointer'/>

        </div>
      </div>
    </>
  );
}

export default ChatRoomHeader;
