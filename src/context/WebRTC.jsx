import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import useStateRef from 'react-usestateref';
import * as spdCompact from 'sdp-compact';

const WebRTCContext = createContext();

export const WebRTCProvider = ({ children }) => {
    const signalingServerUrl = "ws://172.20.1.74:8080/signaling";
    const peerConnections = useRef({});
    const [active, setActive] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useStateRef({});
    const [participants, setParticipants] = useState([]);
    const socket = useRef(null);
    const pendingCandidates = {};

    const initPeerConnection = async (userId) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                {
                    "url": "stun:stun.l.google.com:19302"
                }
            ],
        });
        peerConnections.current[userId] = pc;

        const ls = await openLocalStream();
        ls.getTracks().forEach((track) => {
            pc.addTrack(track, ls);
        });

        // lắng nghe khi một ICE candidate (local) được tạo ra 
        // (ICE candidate được tạo khi createOffer và setLocalDescription)
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendMessage({
                    type: "candidate",
                    candidate: event.candidate.candidate,
                    sdpMid: event.candidate.sdpMid,
                    sdpMLineIndex: event.candidate.sdpMLineIndex,
                    target: userId,
                });
            }
        };

        // Lắng nghe remote stream từ client khác 
        // (sau khi set remote description)
        pc.ontrack = (event) => {
            if (!remoteStreams[userId]) {
                const newStream = new MediaStream();
                setRemoteStreams((prev) => {
                    return {
                        ...prev,
                        [userId]: newStream,
                    };
                });

                remoteStreams[userId] = newStream;
            }

            event.streams[0].getTracks().forEach((track) => {
                // remoteStream.current.addTrack(track);
                remoteStreams[userId].addTrack(track);
            });
            console.log("Remote stream added:", remoteStreams[userId]);
        };
    };

    const openLocalStream = async () => {
        if (!localStream) {
            const ls = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(ls);
            return ls;
        }
        return localStream;
    }

    // Gửi tin nhắn signaling đến server
    function sendMessage (message) {
        console.log("Sending message:", message);
        socket.current.send(JSON.stringify(message));
    }

    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------


    const joinRoom = async (roomId) => {
        try {
            await openLocalStream();
            sendMessage({
                type: "join",
                roomId: roomId
            });

        } catch (error) {
            console.error("Error starting call:", error);
        }
    };


    const createOffer = async () => {
        try {
            // send offer to all participants
            for (const userId of participants) {
                if (!peerConnections.current[userId]) {
                    await initPeerConnection(userId); // Initialize the peer connection
                }
                const pc = peerConnections.current[userId];

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                const options = { compress: true };
                const compactedSPD = spdCompact.compactSDP(offer.sdp, options);
                sendMessage({ type: "offer", sdp: compactedSPD, target: userId });
            }

        } catch (error) {
            console.error('Error creating offer: ', error);
        }
    };

    const handleOffer = async (offer) => {
        const options = { compress: true };
        const decompressedSPD = spdCompact.decompactSDP(offer.sdp, true, options);
        const newOffer = { ...offer, sdp: decompressedSPD };

        // send answer back to the offer sender
        const userId = offer.sender;
        // Initialize the peer connection if it's not already initialized
        if (!peerConnections.current[userId]) {
            await initPeerConnection(userId);
        }
        const pc = peerConnections.current[userId];
        await pc.setRemoteDescription(new RTCSessionDescription(newOffer));

        if (pendingCandidates[userId]) {
            console.log(`Xử lý ${pendingCandidates[userId].length} ICE Candidate đã lưu.`);
            for (const candidate of pendingCandidates[userId]) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Lỗi khi thêm ICE Candidate đã lưu:", err);
                }
            }
            // Xóa hàng đợi sau khi xử lý xong
            pendingCandidates[userId] = [];
        }
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        const compactedSPD = spdCompact.compactSDP(answer.sdp, options);
        sendMessage({ type: "answer", sdp: compactedSPD, target: userId });
    };

    const handleAnswer = async (answer) => {
        const options = { compress: true };
        const compactedSPD = spdCompact.decompactSDP(answer.sdp, false, options);
        const newAnswer = { ...answer, sdp: compactedSPD };

        const userId = answer.sender;
        const pc = peerConnections.current[userId];

        // Đặt Remote Description
        await pc.setRemoteDescription(new RTCSessionDescription(newAnswer));

        // Xử lý các ICE Candidate đã nhận trước đó
        if (pendingCandidates[userId]) {
            console.log(`Processing ${pendingCandidates[userId].length} pending ICE Candidates for userId: ${userId}`);
            for (const candidate of pendingCandidates[userId]) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Error adding ICE Candidate:", err);
                }
            }
            // Xóa hàng đợi sau khi xử lý xong
            pendingCandidates[userId] = [];
        }
    };

    const handleCandidate = async (candidate) => {
        const userId = candidate.sender;

        const pc = peerConnections.current[userId];

        if (!pc || !pc.remoteDescription) {
            console.log("Remote description chưa được thiết lập. Lưu ICE Candidate.");
            if (!pendingCandidates[userId]) {
                pendingCandidates[userId] = [];
            }
            pendingCandidates[userId].push(candidate);
            return;
        }

        try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
            console.error("Lỗi khi thêm ICE Candidate:", err);
        }
    };

    const updateParticipants = (members) => {
        setParticipants(members);
    }

    const handleMemberLeave = (message) => {
        const userId = message.sender;

        // close peer connection
        if (peerConnections.current[userId]) {
            peerConnections.current[userId].close();
            delete peerConnections.current[userId];
        }

        // remove remote stream
        if (remoteStreams[userId]) {
            setRemoteStreams((prev) => {
                const newStreams = { ...prev };
                delete newStreams[userId];
                return newStreams;
            });
        }

        // remove from participants
        setParticipants((prev) => {
            return prev.filter((p) => p !== userId);
        });
    }

    useEffect(() => {
        if (!socket.current) {
            socket.current = new WebSocket(signalingServerUrl);

            socket.current.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            socket.current.onclose = (event) => {
                console.log("WebSocket connection closed:", event);
                // off camera and mic
                localStream.getTracks().forEach((track) => {
                    track.stop();
                });
            };

            // Nhận tin nhắn signaling từ server
            socket.current.onmessage = (event) => {
                const message = JSON.parse(event.data);

                if (message.type === "offer") {
                    handleOffer(message);

                } else if (message.type === "answer") {
                    handleAnswer(message);

                } else if (message.type === "candidate") {

                    handleCandidate(message);
                } else if (message.type === "members") {

                    updateParticipants(message.members);
                } else if (message.type === "leave") {

                    handleMemberLeave(message);
                }
            };
        }

        return () => {
            if (socket.current && socket.current.readyState === WebSocket.OPEN) {
                socket.current.close();
            }
        };

    }, []);


    return (
        <WebRTCContext.Provider
            value={{ joinRoom, createOffer, active, participants, localStream, remoteStreams }}
        >
            {children}
        </WebRTCContext.Provider>
    );
};
export const useWebRTC = () => useContext(WebRTCContext);
