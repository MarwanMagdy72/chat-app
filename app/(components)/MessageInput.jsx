import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { app } from "../Firebase/Firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Button, Modal, Progress } from "flowbite-react";
import Image from "next/image";

function MessageInput({ sendMessage, setMessage, message, image, setImage }) {
  const storage = getStorage(app);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }
    const storageRef = ref(storage, `chatroom_images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          setImage(downloadUrl);
          setOpenModal(false);
          setUploadProgress(null);
          setImagePreview(null);
        });
      }
    );
  };

  const handleSendMessage = () => {
    if (!message?.trim()) {
      alert("Please enter a message before sending.");
      return;
    }
    sendMessage();
    setMessage("");
    setImage(null);
  };

  return (
    <div className="flex items-center p-4 border-t border-gray-200 message-input bg-white  ">
      <FontAwesomeIcon
        icon={faPaperclip}
        className={`  mr-2 cursor-pointer text-lg ${
          image ? "text-blue-500  " : " text-gray-500"
        }   `}
        onClick={() => setOpenModal(true)}
      />
<input
  type="text"
  placeholder="Type a message ..."
  className="flex-1 mx-4  border-none  focus:border-none p-2 outline-none"
  value={message}
  onChange={(e) => {
    setMessage(e.target.value);
  }}
/>

      <FontAwesomeIcon
        icon={faPaperPlane}
        className="text-blue-600 mr-2 text-lg  cursor-pointer"
        onClick={handleSendMessage}
        
      />

      
{/* modal to choose image */}
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        {imagePreview && (
          <Image
            src={imagePreview}
            alt="Image Preview"
            className="max-h-60 w-60 mb-4 m-2"
            width={60}
            height={60}
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 m-2 "
        />
        <Button
          onClick={handleUpload}
          gradientMonochrome="success"
          className="w-40 mx-auto mt-10"
        >
          Upload
        </Button>
        {uploadProgress && (
          <div className="mx-6 my-4">
            <Progress value={100} max="100" size="md" color="blue" />
          </div>
        )}
        <Modal.Body>
          <div className="space-y-6"></div>
        </Modal.Body>
        <Button
          className="absolute right-2 top-2"
          onClick={() => {
            setOpenModal(false);
          }}
        >
          x
        </Button>
      </Modal>
    </div>
  );
}

export default MessageInput;
