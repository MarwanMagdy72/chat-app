import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faImage, 
  faPaperPlane, 
  faSmile, 
  faTimes, 
  faPaperclip,
  faCamera
} from "@fortawesome/free-solid-svg-icons";
import { app } from "../Firebase/Firebase";
import toast from "react-hot-toast";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Button, Modal, Progress } from "flowbite-react";
import Image from "next/image";

function MessageInput({ sendMessage, setMessage, message = "", image, setImage }) {
  const storage = getStorage(app);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-focus on the input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle Enter key press to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check file type
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image first');
      return;
    }
    
    setIsUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `chatroom_images/${fileName}`);
    
    try {
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('Failed to upload image');
          setIsUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
            setImage(downloadUrl);
            setOpenModal(false);
            setUploadProgress(null);
            setImagePreview(null);
            setFile(null);
            setIsUploading(false);
            toast.success('Image uploaded successfully');
            
            // Focus back on the input field
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          });
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setFile(null);
    setUploadProgress(null);
  };

  const handleSendMessage = () => {
    // Send if there's non-empty text or an image
    if ((!message || message.trim() === "") && !image) {
      return;
    }
    
    try {
      sendMessage();
      setMessage("");
      setImage(null);
      
      // Focus back on input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="p-3 border-t border-gray-200 message-input bg-white">
      {/* Display image preview if an image has been selected */}
      {image && (
        <div className="relative mb-2 inline-block">
          <div className="relative group w-24 h-24 overflow-hidden rounded-md border border-gray-200 mr-2">
            <Image
              src={image}
              alt="Selected image"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
            <div 
              className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 rounded-full p-1 cursor-pointer hover:bg-opacity-100 transition-colors"
              onClick={() => setImage(null)}
            >
              <FontAwesomeIcon icon={faTimes} className="text-white text-xs" />
            </div>
          </div>
        </div>
      )}
      
      {/* Message input area */}
      <div className="flex items-center rounded-full border border-gray-300 bg-white overflow-hidden transition-all hover:shadow-md focus-within:shadow-md focus-within:border-indigo-300 px-3">
        {/* Attachment button */}
        <button 
          className="p-2 text-gray-500 hover:text-indigo-600 transition-colors focus:outline-none"
          onClick={() => setOpenModal(true)}
          title="Attach image"
        >
          <FontAwesomeIcon 
            icon={faImage} 
            className={`${image ? "text-indigo-600" : "text-gray-500"}`}
          />
        </button>
        
        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          className="flex-1 py-3 px-2 border-none focus:ring-0 outline-none text-gray-700"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        
        {/* Emoji button - can be implemented with an emoji picker library */}
        <button 
          className="p-2 text-gray-500 hover:text-indigo-600 transition-colors focus:outline-none"
          title="Add emoji"
        >
          <FontAwesomeIcon icon={faSmile} />
        </button>
        
        {/* Send button */}
        <button
          className={`p-2 rounded-full focus:outline-none transition-colors ${message.trim() !== "" || image ? "text-indigo-600 hover:text-indigo-700" : "text-gray-400 cursor-not-allowed"}`}
          onClick={handleSendMessage}
          disabled={!message.trim() && !image}
          title="Send message"
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>

      {/* Hidden file input triggered by the attachment button */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image upload modal */}
      <Modal show={openModal} onClose={() => !isUploading && setOpenModal(false)} size="md">
        <Modal.Header className="border-b border-gray-200 pb-2">
          <h3 className="text-xl font-medium text-gray-900">Upload Image</h3>
        </Modal.Header>
        
        <Modal.Body>
          <div className="space-y-4 p-1">
            {/* Image preview */}
            {imagePreview ? (
              <div className="relative mx-auto max-w-sm">
                <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                  <Image
                    src={imagePreview}
                    alt="Image Preview"
                    width={300}
                    height={300}
                    className="w-full h-auto max-h-64 object-contain"
                  />
                  {!isUploading && (
                    <button
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-100 transition-colors"
                      onClick={clearImage}
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xs" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="mb-3 text-gray-500">
                  <FontAwesomeIcon icon={faCamera} className="text-3xl mb-2" />
                </div>
                <p className="mb-2 text-sm text-gray-700">Click to select an image</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                <Button
                  className="mt-4"
                  onClick={triggerFileInput}
                >
                  Choose Image
                </Button>
              </div>
            )}
            
            {/* File input */}
            {imagePreview && !isUploading && (
              <div className="flex justify-center">
                <Button
                  onClick={triggerFileInput}
                  className="mr-2"
                >
                  Change Image
                </Button>
                <Button
                  onClick={handleUpload}
                  color="indigo"
                >
                  Upload Image
                </Button>
              </div>
            )}
            
            {/* Upload progress */}
            {uploadProgress !== null && (
              <div className="w-full">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-indigo-600">
                    Uploading... {uploadProgress}%
                  </span>
                </div>
                <Progress
                  progress={uploadProgress}
                  progressLabelPosition="inside"
                  color="indigo"
                  textLabel=""
                  size="lg"
                />
              </div>
            )}
          </div>
        </Modal.Body>
        
        <Modal.Footer className="border-t border-gray-200">
          <Button
            color="gray"
            onClick={() => !isUploading && setOpenModal(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MessageInput;
