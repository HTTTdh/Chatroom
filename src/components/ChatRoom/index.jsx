import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Await } from "react-router-dom";
import { FaPhone, FaVideo, FaInfoCircle } from "react-icons/fa"; // Import icons
import {
  AiOutlineUserAdd,
  AiOutlineLink,
  AiOutlineLogout,
} from "react-icons/ai"; // Import các icon cần thiết
import Noti from "../Noti/Noti";
import { useStompClient } from "../../context/StompClientContext";
import MessageInput from "../MessageInput";
import MessageList from "../MessageList";
import { useAuth } from "../../hooks/useAuth";
import "./styles.css";
import Sidebar from "../components/Sidebar";
import Form from "../components/Form";
import { API } from "../../ipConfig";
import "bootstrap/dist/css/bootstrap.min.css";

function ChatRoom() {
  const [showConfirmation, setShowConfirmation] = useState();
  const { stompClient } = useStompClient();
  const info = useAuth();
  // const userID = info.user.uid;
  const [userID, setUserID] = useState("");
  const [messages, setMessages] = useState([]);
  const [isframe, setFrame] = useState(false);
  const roomId = useParams()["roomId"];
  const frameRef = useRef(null);
  const buttonRef = useRef(null);
  const [currentMemberEmail, setCurrentEmail] = useState("");
  const [membersId, setMembersId] = useState([]);
  const [membersEmail, setMemberEmail] = useState([]);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [linkToNavigate, setLinkToNavigate] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        if (roomId.startsWith("pr")) {
          url = `${API}findPrivateRoomById?Id=${roomId}`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const text = await response.text();
          console.log("Raw response text:", text);

          // Ensure the response is valid JSON
          const data = JSON.parse(text);
          const { user1Id, user2Id } = data;
          var urll = "";
          if (user1Id && user2Id) {
            if (user2Id === info.user.uid) {
              urll = `${API}findById?Id=${user1Id}`;
            } else urll = `${API}findById?Id=${user2Id}`;
            const response = await fetch(urll);
            const dataa = await response.json();

            setName(dataa.fullname);
            setAvatar(dataa.photoURL);
          }
        } else {
          var url = `${API}findRoomById?Id=${roomId}`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const text = await response.text();
          console.log("Raw response text:", text);

          // Ensure the response is valid JSON
          const data = JSON.parse(text);

          setName(data.roomName);
          setAvatar(data.avatar);
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };
    fetchRoomData();
  }, [roomId]);

  useEffect(() => {
    if (info.user != null) setUserID(info.user.uid);
  }, [info.user]);

  const handleLeaveGroup = async () => {
    try {
      const url = `${API}leaveChatRoom/${roomId}?userId=${userID}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Request URL:", url);

      const result = await response.text();
      if (response.ok) {
        setNotification("Đã rời khỏi nhóm thành công!");
        navigate("/");
      } else {
        setNotification("Có lỗi xảy ra.");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      setNotification("Không thể kết nối tới server.");
    }
  };
  const handleAddMemberByEmail = async () => {
    try {
      const response = await fetch(
        `${API}findByEmail?email=${currentMemberEmail}`
      );
      const data = await response.json();

      if (!response.ok || data.length === 0 || !data[0]?.uid) {
        console.log("User not found.");
        console.error("User not found or UID missing.");
        return;
      }

      const memberId = data[0].uid;
      const memberEmail = data[0].email;

      if (!membersEmail.includes(memberEmail)) {
        setMemberEmail([...membersEmail, memberEmail]);
      }

      if (!membersId.includes(memberId)) {
        setMembersId([...membersId, memberId]);
      }

      const requestBody = {
        roomId: roomId,
        newMemberId: memberId,
      };

      const addMemberResponse = await fetch(`${API}addNewMember`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const rawResponseText = await addMemberResponse.text();
      console.log("Raw Response:", rawResponseText);

      if (addMemberResponse.ok) {
        setNotification("Member added successfully!");
        navigate(`/chat/${roomId}`);
      } else {
        setNotification("Failed to add member.");
        console.error("Add member response error:", rawResponseText);
        return;
      }

      const url = `${API}addMemberChatRoom/${roomId}?userId=${memberId}`;
      const finalResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Request URL:", url);

      if (finalResponse.ok) {
        // setNotification("Đã thêm thành viên nhóm thành công!");
        closeOverlay();
        navigate(`/chat/${roomId}`);
      } else {
        setNotification("Có lỗi xảy ra khi thêm thành viên vào nhóm.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setNotification("Không thể kết nối tới server.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        frameRef.current &&
        !frameRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        closeFrame();
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const openFrame = () => {
    setFrame(true);
  };
  const closeFrame = () => {
    setFrame(false);
  };

  const handleAddMember = async () => {
    closeFrame();
    setOverlayVisible(true);

    console.log(requestBody);
  };
  const closeOverlay = () => {
    setOverlayVisible(false);
    setCurrentEmail("");
    setMembersId([]);
    setMemberEmail([]);
  };

  const callVideo = () => {
    navigate(`/call/${roomId}`);
  }

  const handleCopyLink = () => {
    const link = window.location.href;
    const textArea = document.createElement("textarea");
    textArea.value = link;
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
      setLinkCopied(true);
      console.log("Đã sao chép liên kết: " + link);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Lỗi sao chép liên kết: ", err);
    }

    document.body.removeChild(textArea);
  };

  const addMessage = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleClick = () => {
    setShowConfirmation(true);
  };
  if (!stompClient || info.loading) {
    return <div>Connecting...</div>;
  } else {
    return (
      <div className="home">
        <Sidebar info={info}></Sidebar>
        <Form />
        <div className="connecting" hidden={stompClient.connected}>
          Connecting...
        </div>
        <div className="welcome-text homechat">
          <div className="group-title">
            <img src={avatar} alt="avatar" className="imagine"></img>
            <h3>{name}</h3>
            <div className="group-items">
              <div className="icons">
                <button
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  ref={buttonRef}
                  onClick={callVideo}
                >
                  <FaPhone
                    size={22}
                    color="#3092e9"
                    className="img"
                    style={{ transform: "scaleX(-1)" }}
                    />{" "}
                </button>
                <button
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  ref={buttonRef}
                  onClick={callVideo}
                >
                  <FaVideo size={25} color="#3092e9" className="img" />
                  </button>
                <button
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  ref={buttonRef}
                  onClick={openFrame}
                >
                  <FaInfoCircle size={24} color="#3092e9" className="img" />
                </button>
                {isframe && (
                  <div className="Frame" ref={frameRef}>
                    <div className="Frame-item">
                      <div className="text-center">
                        <div className="blockquote text">
                          <b>Thông tin phòng chat</b>

                          <img
                            src={avatar}
                            alt="avatar"
                            className="avatar"
                          ></img>
                          <h3>{name}</h3>
                        </div>
                        <div className="blockquote">
                          <button onClick={handleAddMember}>
                            <AiOutlineUserAdd size={24} />
                            <p className="Text">Thêm thành viên mới</p>
                          </button>
                        </div>
                        <div className="blockquote">
                          <button onClick={handleCopyLink}>
                            <AiOutlineLink size={24} />
                            <p className="Text">Sao chép liên kết</p>
                          </button>
                        </div>
                        <div className="blockquote">
                          <button onClick={handleClick}>
                            <AiOutlineLogout size={24} />
                            <p className="Text">Rời khỏi nhóm</p>
                          </button>
                          {showConfirmation && (
                            <div className="confirmation-dialog">
                              <p>Bạn có muốn rời nhóm này không?</p>
                              <button onClick={handleLeaveGroup}>Có</button>
                              <button
                                onClick={() => setShowConfirmation(false)}
                              >
                                Không
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {isOverlayVisible && (
            <div
              className="overlay-message"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                position: "fixed",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
              }}
            >
              <div
                className="overlay-message-content"
                style={{
                  maxWidth: "400px",
                  margin: "10% auto",
                  padding: "20px",
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  position: "relative",
                }}
              >
                <button
                  onClick={closeOverlay}
                  className="btn-close"
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    color: "#000",
                  }}
                >
                  ×
                </button>

                <h4 className="text-center mb-4">Nhập Email Thành Viên</h4>
                <form>
                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control"
                      value={currentMemberEmail}
                      onChange={(e) => setCurrentEmail(e.target.value)}
                      placeholder="Nhập email"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary w-100 mb-3"
                    onClick={handleAddMemberByEmail}
                  >
                    Thêm
                  </button>
                </form>

                <ul className="list-group mb-3">
                  {membersEmail.map((email, index) => (
                    <li
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {email}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {linkCopied && (
            <div className="copied-notification">
              Liên kết đã được sao chép!
            </div>
          )}
          {userID && (
            <MessageList roomId={roomId} userId={userID}></MessageList>
          )}
          <MessageInput roomId={roomId} addMessage={addMessage}></MessageInput>
        </div>
      </div>
    );
  }
}

export default ChatRoom;
