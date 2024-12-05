import React, { useState } from "react";
import "./Sidebar.css"; // Custom CSS for styling
import { useRooms } from "../../hooks/useRooms";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { API } from "../../ipConfig";
function Sidebar ({ info }) {
  const { logout } = useAuth();
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [currentMemberEmail, setCurrentMemberEmail] = useState("");
  const [membersId, setMembersId] = useState([]);
  const [membersEmail, setMemberEmail] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const { onCreateRoom } = useRooms(info.user.uid);

  const handleAddMemberByEmail = async () => {
    try {
      const response = await fetch(
        `${API}findByEmail?email=${currentMemberEmail}`
      );
      const data = await response.json();
      if (response.ok && data.length > 0) {
        const memberId = data[0].uid; // Assuming that you want to use the ID from the response
        const memberEmail = data[0].email;
        if (!membersEmail.includes(memberEmail)) {
          setMemberEmail([...membersEmail, memberEmail]);
        }
        if (!membersId.includes(memberId)) {
          setMembersId([...membersId, memberId]);
        }
      } else {
        alert("User not found.");
      }
    } catch (error) {
      console.error("Error finding user by email:", error);
      alert("Error finding user by email: " + error.message);
    }
  };
  const handleAvatarUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setGroupAvatar(URL.createObjectURL(file));
    }
  };
  const handleCreateRoom = async (e) => {
    if (!roomName) {
      alert("Please provide a room name");
      return;
    }

    const formData = new FormData();
    formData.append("roomName", roomName);
    formData.append("roomOwnerId", info.user.uid);
    formData.append("otherMembersId", membersId);
    if (avatar) {
      formData.append("avatar", avatar);
    }
    const result = await onCreateRoom(formData);
    if (result) {
      alert("Room created successfully!");
      closeOverlay();
      window.location.reload();
    } else {
      alert("Error creating room. Please try again later.");
    }
  };

  const openOverlay = () => {
    setOverlayOpen(true);
  };

  const closeOverlay = () => {
    setOverlayOpen(false);
    setRoomName("");
    setCurrentMemberEmail("");
    setMembersId([]);
    setMemberEmail([]);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-item">
        <img
          src="/image.png"
          alt="Logo"
          className="logo"
          style={{
            borderRadius: "50%",
            border: "1px solid #fff",
          }}
        />
        <p className="logoText">BKConnect</p>
      </div>
      <div style={{ border: "1px solid #ccc" }}></div>
      <div className="sidebar-item">
        <button>
          <i
            className="far fa-comment"
            style={{ fontSize: "16px", color: "white" }}
          ></i>
          <p className="logoText">Chat</p>
        </button>
      </div>

      <div className="sidebar-item">
        <button onClick={openOverlay}>
          <i
            className="far fa-plus-square"
            style={{ fontSize: "16px", color: "white" }}
          ></i>
          <p className="logoText">Tạo phòng</p>
        </button>
      </div>
      <div className="sidebar-item">
        <button>
          <i
            className="far fa-edit"
            style={{ fontSize: "16px", color: "white" }}
          ></i>
          <p className="logoText">Hồ sơ của tôi</p>
        </button>
      </div>
      {isOverlayOpen && (
        <div className="overlay">
          <div className="overlay-content">
            <div className="overlay-title">
              <h4>Tạo nhóm</h4>
              <button onClick={closeOverlay}>
                <i
                  className="far fa-times-circle"
                  style={{ fontSize: "24px" }}
                ></i>
              </button>
            </div>
            <div className="avatar-upload">
              <div
                className="avatar-preview"
                onClick={() => document.getElementById("file-input").click()}
              >
                {groupAvatar ? (
                  <img
                    src={groupAvatar}
                    alt="Avatar nhóm"
                    className="avatar-img"
                  />
                ) : (
                  <div className="placeholder-avatar">No Image</div>
                )}
              </div>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="file-input"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Tên nhóm"
                className="search-input"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>

            <h4 style={{ textAlign: "left" }}>Thêm danh sách các thành viên</h4>
            <div className="search-email">
              <input
                type="text"
                value={currentMemberEmail}
                onChange={(e) => setCurrentMemberEmail(e.target.value)}
                placeholder="Nhập email"
                className="search-input"
              />
              <button onClick={handleAddMemberByEmail}>Thêm</button>
            </div>
            <div className="list">
              <ul className="email-list">
                {membersEmail.map((email, index) => (
                  <li key={index} className="email-item">
                    {email}
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={handleCreateRoom} className="styled-button">
              Tạo Phòng
            </button>
          </div>
        </div>
      )}

      <div className="sidebar-item">
        <button
          onClick={logout}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <i
            className="fas fa-sign-out-alt"
            style={{ fontSize: "16px", color: "white" }}
          ></i>
          <p className="logoText">Đăng xuất</p>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
