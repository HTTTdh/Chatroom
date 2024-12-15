import React, { useEffect, useState, useRef } from "react";
import { useRooms } from "../../hooks/useRooms";
import { useMessages } from "../../hooks/useMessages";
import { useNotifications } from "../../hooks/useNotifications";
import { Link } from "react-router-dom";
import "./style.css";
import { API } from "../../ipConfig.js";
import { useLastMessage } from "../../hooks/useLastMessages";

function JoinedRooms ({ userId }) {
  const containerRef = useRef(null);
  const { joinedRooms } = useRooms(userId);
  const [displayNames, setDisplayNames] = useState({});
  const [avatar, setAvatar] = useState({});
  const { noti, setNoti } = useNotifications(userId);
  const lastMessages = useLastMessage();

  const markAllNotiInARoomAsRead = async (roomId) => {
    const updatedNoti = noti.filter(
      (notification) => notification.chatRoomId != roomId
    ); // Loại bỏ thông báo trong room đã được đánh dấu là đã đọc
    setNoti(updatedNoti); // Cập nhật lại trạng thái thông báo trên UI
    console.log(updatedNoti, "  ", roomId);

    noti.forEach(async (notification) => {
      if (notification.chatRoomId === roomId) {
        const url = `${API}markAsRead/${notification.notificationId}`;
        await fetch(url);
      }
    });
  };

  useEffect(() => {
    const fetchDisplayNames = async () => {
      const names = {};
      const avatars = {};
      await Promise.all(
        joinedRooms.map(async (room) => {
          const { roomName, user1Id, user2Id, avatar } = room;

          if (roomName) {
            names[room.id] = roomName;
            avatars[room.id] = avatar;
          }
          var url = "";
          if (user1Id && user2Id) {
            try {
              if (user2Id === userId) {
                url = `${API}findById?Id=${user1Id}`;
              } else url = `${API}findById?Id=${user2Id}`;
              const response = await fetch(url);
              const data = await response.json();

              names[room.id] = data.fullname;
              avatars[room.id] = data.photoURL;
            } catch (error) {
              names[room.id] = "Error loading name";
            }
          }
        })
      );
      setDisplayNames(names);
      setAvatar(avatars);
    };

    fetchDisplayNames();
  }, [joinedRooms]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [joinedRooms]);

  return (
    <div ref={containerRef}>
      {joinedRooms.map((room) => {
        return (
          <div className="group" key={room.id}>
            <img src={avatar[room.id]} alt="avatar" className="imagine" />
            <div className="group-item">
              <div className="info">
                <Link
                  to={`/chat/${room.id}`}
                  className="link"
                  onClick={() => markAllNotiInARoomAsRead(room.id)}
                >
                  {displayNames[room.id] || "Loading..."}
                </Link>
              </div>
              <div className="last-message">
                {Object.entries(lastMessages).map(
                  ([roomId, { sender, timestamp }]) => {
                    if (roomId === room.id && sender.uid !== userId) {
                      return (
                        <p key={roomId}>
                          {sender.fullname} vừa gửi một tin nhắn mới{" "}
                          {(() => {
                            const messageDate = new Date(timestamp); // Chuyển timestamp của tin nhắn thành đối tượng Date
                            const currentDate = new Date(); // Lấy thời gian hiện tại

                            // Tính toán số giờ chênh lệch
                            const hoursDiff = Math.floor(
                              (currentDate - messageDate) / (1000 * 60 * 60)
                            );

                            // Trả về chuỗi thích hợp
                            if (hoursDiff == 0) {
                              const minutesDiff = Math.floor(
                                (currentDate - messageDate) / (1000 * 60)
                              );
                              if (minutesDiff == 0) {
                                return `vừa xong`;
                              } else {
                                return `${minutesDiff} phút trước`;
                              }
                            } else {
                              if (hoursDiff > 24) {
                                return `${Math.floor(
                                  hoursDiff / 24
                                )} ngày trước`;
                              }
                              return `${hoursDiff} giờ trước`;
                            }
                          })()}
                        </p>
                      );
                    }
                  }
                )}
              </div>
            </div>
            <div className="notification">
              {noti.filter((n) => n.chatRoomId === room.id).length > 0 && (
                <span className="notification-badge">
                  {noti.filter((n) => n.chatRoomId === room.id).length}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { JoinedRooms };
