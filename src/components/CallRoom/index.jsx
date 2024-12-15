import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useWebRTC } from "../../context/WebRTC";
import VideoGrid from "../VideoGrid";

function CallRoom () {
    const roomId = useParams()["roomId"];
    const { joinRoom, createOffer, active, participants, localStream, remoteStreams } = useWebRTC();
    const [audioState, setAudioState] = useState(true);
    const [videoState, setVideoState] = useState(true);

    useEffect(() => {
        async function startJoinRoom () {
            await joinRoom(roomId);
        }
        startJoinRoom();
    }, []);

    useEffect(() => {
        async function startCreateOffer () {
            if (participants.length > 0) {
                await createOffer();
            }
        }
        startCreateOffer();
    }, [participants]);

    const toggleAudio = () => {
        localStream.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;
            setAudioState(track.enabled);

        });
    };
    const toggleVideo = () => {
        localStream.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
            setVideoState(track.enabled);
        });
    };

    useEffect(() => {
        console.log("Cập nhập remoteStreams", remoteStreams);
    }, [remoteStreams]);

    const leaveRoom = () => {
        window.location.href = "/";
    };

    return (
        <div style={{ padding: "20px", backgroundColor: "#282c34", height: "100vh" }}>
            <h1 style={{ textAlign: "center", color: "#fff", marginBottom: "20px" }}>Video Call</h1>

            <div
                id="roomDiv"
                className="d-flex flex-column align-items-center"
                style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                    backgroundColor: "#1e1e1e",
                    borderRadius: "10px",
                    padding: "20px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                }}
            >

                <VideoGrid participants={participants} remoteStreams={remoteStreams} />

                {/* Video của chính mình (luôn cố định góc trái) */}
                {localStream && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: "10px",
                            left: "10px",
                            width: "150px",
                            height: "150px",
                            backgroundColor: "#000",
                            borderRadius: "10px",
                            overflow: "hidden",
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        <video
                            key="local"
                            className="local-video"
                            muted
                            autoPlay
                            playsInline
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                            ref={(video) => {
                                if (video) {
                                    video.srcObject = localStream;
                                }
                            }}
                        ></video>
                    </div>
                )}

                <div className="d-flex justify-content-center" style={{ margin: "10px", display: "flex", flexDirection: "row" }}>
                    <button
                        id="toggleVideo"
                        className="btn-circle control-button"
                        onClick={() => toggleVideo()}
                        style={{
                            backgroundColor: videoState ? '#28a745' : '#dc3545',
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "60px",
                            height: "60px",
                            margin: "0 10px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                    >
                        <i className="bi bi-camera-video-fill"></i>
                        Camera
                    </button>
                    <button
                        id="toggleAudio"
                        className="btn-circle control-button"
                        onClick={() => toggleAudio()}
                        style={{
                            backgroundColor: audioState ? '#28a745' : '#dc3545',
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "60px",
                            height: "60px",
                            margin: "0 10px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                    >
                        <i className="bi bi-mic-fill"></i>
                        Audio
                    </button>
                </div>

                <button
                    id="leaveRoom"
                    onClick={leaveRoom}
                    style={{
                        backgroundColor: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "10px 20px",
                        cursor: "pointer",
                        fontSize: "16px",
                    }}
                >
                    Leave Room
                </button>
            </div>
        </div>
    );
}

export default CallRoom;