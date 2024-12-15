import { useMessages } from "../../hooks/useMessages";
import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import "./styles.css";
import { API } from "../../ipConfig";
import { useNavigate } from "react-router-dom";
import Noti from "../Noti/Noti";
function MessageList({ roomId, userId }) {
  const messages = useMessages(roomId);
  const navigate = useNavigate();
  const containerRef = React.useRef(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [linkToNavigate, setLinkToNavigate] = useState("");
  const [notification, setNotification] = useState("");

  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const ImageComponent = ({ imageUrl }) => {
    const [isShowImg, setShowImg] = useState(false);

    const openShowImg = () => {
      setShowImg(true);
    };

    const closeShowImg = () => {
      setShowImg(false);
    };

    return (
      <div className="image-container">
        <button
          onClick={openShowImg}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <img
            className="custom-img"
            src={imageUrl}
            alt="Uploaded"
            style={{
              maxWidth: "200px",
              maxHeight: "200px",
              marginTop: "10px",
            }}
          />
        </button>
        {isShowImg && (
          <div className="showimg">
            <div className="showimg-content" style={{ position: "relative" }}>
              <button
                onClick={closeShowImg}
                style={{
                  position: "absolute",
                  top: "1px",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <i
                  className="far fa-times-circle"
                  style={{ fontSize: "24px" }}
                ></i>
              </button>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "300px",
                  width: "100%",
                }}
              >
                <img
                  src={imageUrl}
                  alt="Image"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const handleLinkClick = (linkk) => {
    console.log("Link clicked: ", linkk);
    setLinkToNavigate(linkk);
    setShowConfirmation(true);
  };

  const confirmNavigation = async () => {
    setShowConfirmation(false);
    const parts = linkToNavigate.split("/chat/");
    const room = parts[1];
    const requestBody = {
      roomId: room,
      newMemberId: userId,
    };

    console.log(requestBody);

    try {
      const addMemberResponse = await fetch(`${API}addNewMember`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (addMemberResponse.ok) {
        setNotification("Member added successfully ");
        navigate(`/chat/${room}`);
      } else {
        setNotification("Failed to add member.");
      }
    } catch (error) {
      setNotification("Error occurred");
    }
  };

  function Message({ message, type }) {
    const { sender, content, imageUrl } = message;
    const [displayedSender, setDisplayedSender] = useState(sender);

    // Khi sender thay đổi, cập nhật lại state
    useEffect(() => {
      if (sender) {
        setDisplayedSender(sender);
      }
    }, [sender]);

    if (!sender) {
      return (
        <div className={["message", type].join(" ")}>
          <div className={["sender", type].join(" ")}>Loading sender...</div>
          <div className="message-content">
            {content && <div className="text">{content}</div>}
            {imageUrl && <ImageComponent imageUrl={imageUrl} />}
          </div>
        </div>
      );
    }

    const senderName = sender.fullname;
    const renderContent = (content) => {
      const parts = content.split(" ");
      return parts.map((part, index) => {
        if (part.startsWith("http")) {
          return (
            <a
              key={index}
              href={part}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(part);
              }}
              style={{ color: "white", textDecoration: "underline" }}
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part} </span>;
      });
    };
    // const leaveChatRoom = (message) => {
    //   const mes = "da roi nhom";
    //   if (typeof message === "string" && message.endsWith(mes)) {
    //     return <div className="messageout"> {message}</div>;
    //   } else return null;
    // };
    return (
      <div className={["message", type].join(" ")}>
        <div className={["sender", type].join(" ")}>
          {type === "outgoing"
            ? "You"
            : displayedSender.fullname || "Loading sender..."}
        </div>
        <div className="message-content">
          {/* {leaveChatRoom(message)} */}
          {content && <div className="text">{renderContent(content)}</div>}

          {imageUrl && <ImageComponent imageUrl={imageUrl} />}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container" ref={containerRef}>
      <Noti message={notification} />

      {messages &&
        messages.map((x) => (
          <Message
            key={x.id}
            message={x}
            type={x.sender.uid === userId ? "outgoing" : "incoming"}
          />
        ))}
      {showConfirmation && (
        <div className="confirmation-dialog">
          <p>Bạn có muốn tham gia nhóm này không?</p>
          <button onClick={confirmNavigation}>Có</button>
          <button onClick={() => setShowConfirmation(false)}>Không</button>
        </div>
      )}
    </div>
  );
}

export default MessageList;
