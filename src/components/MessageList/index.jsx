import { useMessages } from "../../hooks/useMessages";
import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import "./styles.css";
import { API } from "../../ipConfig";
import { useNavigate } from "react-router-dom";
function MessageList({ roomId, userId }) {
  const messages = useMessages(roomId);
  const navigate = useNavigate();
  const containerRef = React.useRef(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [linkToNavigate, setLinkToNavigate] = useState("");

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
            <div className="showimg-content">
              <button onClick={closeShowImg}>
                <i class="far fa-times-circle" style={{ fontSize: "24px" }}></i>
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
        alert("Member added successfully ");
        navigate(`/chat/${room}`);
      } else {
        alert("Failed to add member.");
      }
    } catch (error) {
      alert("Error occurred: " + error.message);
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
    return (
      <div className={["message", type].join(" ")}>
        <div className={["sender", type].join(" ")}>
          {type === "outgoing"
            ? "You"
            : displayedSender.fullname || "Loading sender..."}
        </div>
        <div className="message-content">
          {content && <div className="text">{renderContent(content)}</div>}

          {imageUrl && <ImageComponent imageUrl={imageUrl} />}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container" ref={containerRef}>
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
