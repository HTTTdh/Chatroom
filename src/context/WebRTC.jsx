import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as spdCompact from 'sdp-compact';

const WebRTCContext = createContext();

export const WebRTCProvider = ({ children }) => {
    const peerConnection = useRef(null);
    const localStream = useRef(null);
    const remoteStream = useRef(new MediaStream());
    const signalingServerUrl = "ws://192.168.1.3:8080/signaling";
    const socket = useRef(null);

    const initPeerConnection = async () => {
        peerConnection.current = new RTCPeerConnection({
            iceServers: [
                {
                    "url": "stun:stun.l.google.com:19302"
                }
            ],
        });

        // lắng nghe khi một ICE candidate (local) được tạo ra 
        // (ICE candidate được tạo khi createOffer và setLocalDescription)
        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                sendMessage({
                    type: "candidate",
                    candidate: event.candidate.candidate,
                    sdpMid: event.candidate.sdpMid,
                    sdpMLineIndex: event.candidate.sdpMLineIndex,
                });
            }
        };

        // Lắng nghe remote stream từ client khác 
        // (sau khi set remote description)
        peerConnection.current.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.current.addTrack(track);
            });
        };
    };

    const openLocalStream = async () => {
        localStream.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
    }

    const addLocalStreaamToPGetPC = async () => {
        localStream.current.getTracks().forEach((track) => {
            console.log("add track");
            peerConnection.current.addTrack(track, localStream.current);
        });
    }

    // Gửi tin nhắn signaling đến server
    function sendMessage (message) {
        console.log("Sending message:", message);
        socket.current.send(JSON.stringify(message));
    }



    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------


    const startCall = async (roomId) => {
        try {
            await initPeerConnection();
            await openLocalStream();
            await addLocalStreaamToPGetPC();
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
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);

            const options = { compress: true };
            const compactedSPD = spdCompact.compactSDP(offer.sdp, options);
            sendMessage({ type: "offer", sdp: compactedSPD });

        } catch (error) {
            console.error('Error creating offer: ', error);
        }
    };

    const handleOffer = async (offer) => {
        const options = { compress: true };
        const decompressedSPD = spdCompact.decompactSDP(offer.sdp, true, options);
        const newOffer = { ...offer, sdp: decompressedSPD };
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(newOffer));

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        const compactedSPD = spdCompact.compactSDP(answer.sdp, options);
        sendMessage({ type: "answer", sdp: compactedSPD });
    };

    const handleAnswer = async (answer) => {
        const options = { compress: true };
        const compactedSPD = spdCompact.decompactSDP(answer.sdp, false, options);
        const newAnswer = { ...answer, sdp: compactedSPD };
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(newAnswer));
    };

    const handleCandidate = (candidate) => {
        if (peerConnection.current) {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    useEffect(() => {
        if (!socket.current) {
            socket.current = new WebSocket(signalingServerUrl);

            socket.current.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            socket.current.onclose = (event) => {
                console.log("WebSocket connection closed:", event);
                // off camera and mic
                localStream.current.getTracks().forEach((track) => {
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
            value={{ startCall, createOffer, localStream, remoteStream }}
        >
            {children}
        </WebRTCContext.Provider>
    );
};
export const useWebRTC = () => useContext(WebRTCContext);
