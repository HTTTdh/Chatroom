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

  useEffect(() => {
    fetch(`${API}getNotifications/${user.uid}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          console.error("Data is not an array:", data);
          setNotifications([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      });
  }, [user.id]);

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
            {notifications.map((notification, index) => (
              <li
                key={index}
                className={`notification-item ${
                  notification.isRead ? "read" : "unread"
                }`}
              >
                <img
                  src={notification.sender.photoURL}
                  alt={notification.sender.fullname}
                  className="notification-avatar"
                />
                <div className="notification-details">
                  {notification.notificationType === "MEMBER_ADDED" ? (
                    <p>{`${notification.sender.fullname} được thêm vào đoạn chat.`}</p>
                  ) : notification.notificationType === "MEMBER_REMOVED" ? (
                    <p>{`${notification.sender.fullname} đã rời khỏi đoạn chat.`}</p>
                  ) : (
                    <p>{notification.message}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notification;
