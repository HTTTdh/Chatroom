import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { JoinedRooms } from "../JoinedRooms/joined-rooms";
import { useForm } from "react-hook-form";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Picker from "emoji-picker-react";
import { useStompClient } from "../../context/StompClientContext";
import "./Form.css";
import { API } from "../../ipConfig";
const Form = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [membersId, setMembersId] = useState([]);
  const [membersEmail, setMemberEmail] = useState([]);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const { register, handleSubmit } = useForm();
  const [image, setImage] = useState(null);
  const [currentMemberEmail, setCurrentMemberEmail] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  var [typing, setTyping] = useState("");

  const closeOverlay = () => {
    setOverlayVisible(false);
    setFoundUser(null);
    setCurrentMemberEmail("");
  };
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("receiverId", membersId);
    formData.append("senderId", user.uid);
    formData.append("content", typing);
    if (image) {
      formData.append("file", image);
    }

    const res = await fetch(`${API}sendMessageToUser `, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const savedMessage = await res.json();
      // navigate(`/chat/${roomId}`);
      navigate(0);
      console.log(savedMessage);
    } else {
      console.error("Error sending message:", res.statusText);
    }

    setTyping("");
    setImage(null);
    setImagePreview(null);
    closeOverlay();
  };

  const handleChange = (event) => {
    setTyping(event.target.value);
  };
  const handleEmailChange = (e) => {
    setCurrentMemberEmail(e.target.value);
  };
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCameraClick = () => {
    document.getElementById("fileInput").click();
  };

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emojiObject, event) => {
    if (emojiObject && emojiObject.emoji) {
      setTyping((prevTyping) => prevTyping + emojiObject.emoji);
    }
  };
  const handleAddMemberByEmail = async () => {
    try {
      console.log(currentMemberEmail);
      const response = await fetch(
        `${API}findByEmail?email=${currentMemberEmail}`
      );
      const data = await response.json();
      console.log(data);
      if (response.ok && data.length > 0) {
        const memberId = data[0].uid;
        const memberEmail = data[0].email;
        if (!membersEmail.includes(memberEmail)) {
          setMemberEmail([...membersEmail, memberEmail]);
        }
        if (!membersId.includes(memberId)) {
          setMembersId([...membersId, memberId]);
        }
        setFoundUser(data[0]);
        setOverlayVisible(true);
      } else {
        alert("User not found.");
      }
    } catch (error) {
      console.error("Error finding user by email:", error);
      alert("Error finding user by email: " + error.message);
    }
  };
  return (
    <div className="page">
      <h2>Chat</h2>
      <div className="search">
        <input
          type="text"
          value={currentMemberEmail}
          onChange={handleEmailChange}
          placeholder="Nhập email"
          className="search-input"
        />
        <button onClick={handleAddMemberByEmail}>Tìm kiếm</button>
      </div>
      <div className="chat">
        <JoinedRooms userId={user.uid} />
      </div>
      {overlayVisible && foundUser && (
        <div className="overlay-message">
          <div className="overlay-message-content">
            <h3>Thông tin người dùng</h3>
            <img src={foundUser.photoURL} alt="avatar" className="avatar"></img>
            <p>Email: {foundUser.email}</p>
            <p>Tên: {foundUser.fullname}</p>
            <p>ID: {foundUser.uid}</p>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="search">
                <div className="textZonee" style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Message"
                    value={typing}
                    onChange={handleChange}
                    aria-label="Message input"
                    style={{ paddingRight: "100px" }} // Dành chỗ cho icon
                  />
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    {...register("file")}
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                  <div className="input-icons">
                    <div className="emoji">
                      <BsEmojiSmileFill
                        onClick={handleEmojiPickerhideShow}
                        className="icon "
                      />
                      {showEmojiPicker && (
                        <Picker
                          onEmojiClick={handleEmojiClick}
                          style={{
                            marginTop: "-350px",
                            height: "350px",
                            width: "300px",
                            backgroundColor: "#fff",
                            borderRadius: "10px",
                            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
                          }}
                        />
                      )}
                    </div>
                    <i
                      className="fas fa-camera icon"
                      onClick={handleCameraClick}
                    ></i>
                    <i className="fas fa-microphone icon"></i>
                  </div>
                  <button
                    style={{
                      backgroundColor: "#4CAF50",
                      color: "white",
                      padding: "10px 20px",
                      fontSize: "16px",
                      cursor: "pointer",
                      border: "none",
                      borderRadius: "5px",
                      marginTop: "10px",
                    }}
                  >
                    Gửi
                  </button>
                  <button onClick={closeOverlay} aria-label="Close overlay">
                    Đóng
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
