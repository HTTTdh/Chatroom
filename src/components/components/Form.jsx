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
import Noti from "../Noti/Noti";
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
  const [notification, setNotification] = useState("");

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
        setNotification("User not found");
      }
    } catch (error) {
      console.error("Error finding user by email:", error);
      setNotification("Error finding user by email");
    }
  };
  return (
    <div className="page">
      <Noti message={notification} />

      <div className="contentt">
        <h2 style={{ textAlign: "center" }}>Chat</h2>
        {/* <div className="search">
        <input
          type="text"
          value={currentMemberEmail}
          onChange={handleEmailChange}
          placeholder="Nhập email"
          className="search-input"
        />
        <button onClick={handleAddMemberByEmail}>Tìm kiếm</button>
        </div> */}
        <div className="search-container">
          <div className="search-icon">
            <svg viewBox="6 6 24 24" fill="currentColor" width="20" height="20">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M23.522 21.662c-.389-.344-.443-.925-.181-1.373a8.5 8.5 0 1 0-3.051 3.051c.447-.261 1.028-.207 1.372.182l3.608 4.073a1.647 1.647 0 1 0 2.325-2.326l-4.073-3.607zm-3.28-9.905a6 6 0 1 1-8.484 8.486 6 6 0 0 1 8.485-8.486z"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            value={currentMemberEmail}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleAddMemberByEmail(e.target.value); // Gọi hàm tìm kiếm khi nhấn Enter
              }
            }}
            onChange={handleEmailChange}
            placeholder="Nhập email"
            className="search-input"
          />
        </div>

        <div className="chat">
          <JoinedRooms userId={user.uid} />
        </div>
        {overlayVisible && foundUser && (
          <div className="overlay-message">
            <div className="overlay-message-content">
              <h3>Thông tin người dùng</h3>
              <img
                src={foundUser.photoURL}
                alt="avatar"
                className="avatar"
              ></img>
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
                        fontSize: "16px",
                        cursor: "pointer",
                        border: "none",
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
    </div>
  );
};

export default Form;
