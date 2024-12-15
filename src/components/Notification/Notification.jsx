import React, { useEffect, useState } from "react";
import "./styles.css";
import { FaBell } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import ImageSlider from "../components/ImageSlider";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { API } from "../../ipConfig";

function Notification() {
  const info = useAuth();
  const navigate = useNavigate();

  if (info.loading) {
    return <div>Loading...</div>;
  }

  if (!info.user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="home">
      <Sidebar info={info} />
      <MyNotification user={info.user} />
      <ImageSlider />
    </div>
  );
}

const MyNotification = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomNames, setRoomNames] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomData = async (chatRoomId) => {
      try {
        console.log(chatRoomId);
        const url = `${API}findRoomById?Id=${chatRoomId}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        console.log("Raw response text:", text);

        const data = JSON.parse(text);
        console.log(data.roomName);
        return data.roomName;
      } catch (error) {
        console.error("Error fetching room data:", error);
        return null;
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API}getNotifications/${user.uid}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setNotifications(data);
          console.log(data);

          const roomNamesData = {};

          for (const notification of data) {
            const chatRoomId = notification.chatRoomId;
            if (chatRoomId && !roomNamesData[chatRoomId]) {
              const roomName = await fetchRoomData(chatRoomId);
              roomNamesData[chatRoomId] = roomName;
            }
          }
          console.log(roomNamesData);
          setRoomNames(roomNamesData);
        } else {
          console.error("Data is not an array:", data);
          setNotifications([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user.uid]);

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="form">
      <div className="content">
        <h6>
          <FaBell style={{ marginRight: "10px" }} />
          THÔNG BÁO
        </h6>
        {notifications.length === 0 ? (
          <p>Không có thông báo nào.</p>
        ) : (
          <ul className="notification-list">
            {notifications.map((notification, index) => {
              const roomName = roomNames[notification.chatRoomId];
              console.log("data: " + roomName);
              return (
                <li
                  key={index}
                  className={`notification-item ${
                    notification.isRead ? "read" : "unread"
                  }`}
                  onClick={() => {
                    console.log("Clicked!");
                    navigate(`/chat/${notification.chatRoomId}`);
                  }}
                >
                  <img
                    src={notification.sender.photoURL}
                    alt={notification.sender.fullname}
                    className="notification-avatar"
                  />
                  <div className="notification-details">
                    {notification.notificationType === "MEMBER_ADDED" ? (
                      <p>{`${
                        notification.sender.fullname
                      } được thêm vào đoạn chat ${
                        roomName ? `${roomName}` : ""
                      }.`}</p>
                    ) : notification.notificationType === "MEMBER_REMOVED" ? (
                      <p>{`${
                        notification.sender.fullname
                      } đã rời khỏi đoạn chat ${
                        roomName ? `${roomName}` : ""
                      }.`}</p>
                    ) : (
                      <p>{notification.message}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notification;
