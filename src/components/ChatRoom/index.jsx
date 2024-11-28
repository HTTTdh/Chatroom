import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Await } from "react-router-dom";
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
  const { stompClient } = useStompClient();
  const info = useAuth();
  const userID = info.user.uid;
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
    console.log("sadd");
    fetchRoomData();
  }, [roomId]);

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
        alert("Đã rời khỏi nhóm thành công!");
        navigate("/");
      } else {
        alert(result || "Có lỗi xảy ra.");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không thể kết nối tới server.");
    }
  };

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

      // Check if the user data exists
      if (!data || !data[0]?.uid) {
        console.error("User not found or UID missing.");
        return;
      }

      const requestBody = {
        roomId: roomId,
        newMemberId: data[0].uid,
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

      if (
        addMemberResponse.headers
          .get("content-type")
          ?.includes("application/json")
      ) {
        const jsonResponse = JSON.parse(rawResponseText);

        if (addMemberResponse.ok) {
          alert("Member added successfully:", JSON.stringify(jsonResponse));
          closeOverlay();
          navigate(`/chat/${roomId}`);
        } else {
          alert("Failed to add member:", jsonResponse);
        }
      } else {
        if (addMemberResponse.ok) {
          alert("Member added successfully. Response:", rawResponseText);
          closeOverlay();
          navigate(`/chat/${roomId}`);
        } else {
          alert("Failed to add member. Response:", rawResponseText);
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
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

  useEffect(() => {
    if (!info.user) {
      navigate("/");
    }
  }, [info.user]);

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
                <img src="/phone.png" alt=""></img>
                <img src="/face.png" alt=" "></img>
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
                  <img src="/detail.png" alt=""></img>
                </button>
                {/* {isframe && (
                  <div className="Frame" ref={frameRef}>
                    <div className="Frame-item">
                      <figure class="text-center">
                        <blockquote class="blockquote">
                          <b>Thông tin phòng chat </b>
                        </blockquote>
                        <blockquote
                          class="blockquote"
                          onClick={handleAddMember}
                        >
                          <b className="item">Thêm thành viên mới</b>
                        </blockquote>
                        <blockquote class="blockquote" onClick={handleCopyLink}>
                          <b className="item">Sao chép liên kết</b>
                        </blockquote>
                      </figure>
                    </div>
                  </div>
                )} */}
                {isframe && (
                  <div className="Frame" ref={frameRef}>
                    <div className="Frame-item">
                      <figure className="text-center">
                        <blockquote className="blockquote">
                          <b>Thông tin phòng chat</b>
                        </blockquote>
                        <blockquote
                          className="blockquote"
                          onClick={handleAddMember}
                        >
                          <b className="item">Thêm thành viên mới</b>
                        </blockquote>
                        <blockquote
                          className="blockquote"
                          onClick={handleCopyLink}
                        >
                          <b className="item">Sao chép liên kết</b>
                        </blockquote>
                        <blockquote
                          className="blockquote"
                          onClick={handleLeaveGroup}
                        >
                          <b className="item">Rời khỏi nhóm</b>
                        </blockquote>
                      </figure>
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
          <MessageList roomId={roomId} userId={info.user.uid}></MessageList>
          <MessageInput roomId={roomId} addMessage={addMessage}></MessageInput>
        </div>
      </div>
    );
  }
}

export default ChatRoom;
