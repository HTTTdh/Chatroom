import { createContext, useContext } from "react";
import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { useAuth } from "../hooks/useAuth";
import { WS } from "../ipConfig";
import { API } from "../ipConfig";

const StompClientContext = createContext();
export const StompClientProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  const lastMessagesRef = useRef({});

  async function fetchChatNoti(userId) {
    const response = await fetch(
      `${API}getLatestNotificationsByChatRoomIdAndUserId/` + userId
    );
    const data = await response.json();

    // Cập nhật lastMessagesRef từ dữ liệu tải về
    lastMessagesRef.current = data.reduce((acc, room) => {
      acc[room.chatRoomId] = {
        sender: room.sender,
        timestamp: room.timestamp,
      };
      return acc;
    }, {});
  }

  // Sử dụng ref để giữ giá trị của onMessageCallback
  const messageCallbackRef = useRef(null);
  const notificationCallbackRef = useRef(null);

  // Hàm để set callback
  const setOnMessageCallback = (callback) => {
    messageCallbackRef.current = callback;
  };

  const setOnNotificationCallback = (callback) => {
    notificationCallbackRef.current = callback;
  };

  function onMessageReceived(newMessage) {
    const parsedNewMessage = JSON.parse(newMessage.body);

    const { chatRoomId, sender, timestamp } = parsedNewMessage;
    lastMessagesRef.current[chatRoomId] = {
      sender: sender,
      timestamp: timestamp,
    };

    // Gọi hàm callback nếu nó đã được set
    if (messageCallbackRef.current) {
      messageCallbackRef.current(parsedNewMessage);
    }

    if (notificationCallbackRef.current) {
      notificationCallbackRef.current(parsedNewMessage);
    }
  }

  useEffect(() => {
    if (!user) {
      // console.log("User is not authenticated");
      return;
    }
    const stompClient = new Client({
      brokerURL: `${WS}`,
    });
    setStompClient(stompClient);

    stompClient.activate();

    stompClient.onConnect = async () => {
      console.log("ok connected");

      setIsConnected(true);
      // subscribe to the topic, the callback is invoked whenever a message is received
      await fetchChatNoti(user.uid);

      // subcribe to the user's queue (receive noti)
      stompClient.subscribe(
        `/user/${user.uid}/queue/messages`,
        onMessageReceived
      );
      // subscribe to the public topic (got who is connected )
      stompClient.subscribe(`/user/public`, onMessageReceived);

      // register the connected user to server
      stompClient.publish({
        destination: "/app/addUser",
        body: JSON.stringify({
          uid: user.uid,
          fullname: user.displayName,
          photoURL: user.photoURL,
          status: "ONLINE",
          email: user.email,
        }),
      });
    };

    stompClient.onWebSocketError = (error) => {
      console.error("Error with websocket", error);
    };

    stompClient.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    // deactivate the client when the component is unmounted
    return () => {
      stompClient.deactivate();
    };
  }, [user]);

  return (
    <StompClientContext.Provider
      value={{
        stompClient,
        isConnected,
        setOnMessageCallback,
        setOnNotificationCallback,
        lastMessagesRef,
      }}
    >
      {children}
    </StompClientContext.Provider>
  );
};

export const useStompClient = () => useContext(StompClientContext);
