import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useWebRTC } from "../../context/WebRTC";

function CallRoom () {
    const roomId = useParams()["roomId"];
    const { startCall, createOffer, localStream, remoteStream } = useWebRTC();
    const [isCallStarted, setIsCallStarted] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        const setupStreams = async () => {
            if (!isCallStarted) {
                await startCall(roomId);
                await createOffer();
                setIsCallStarted(true);

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream.current;
                }
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream.current;
                }
            }
        };

        setupStreams();

    }, [isCallStarted]);

    const toggleTrack = (type) => {
        if (localStream.current) {
            const track = localStream.current
                .getTracks()
                .find((t) => t.kind === type);
            if (track) {
                track.enabled = !track.enabled;
            }
        }
    };

    const leaveRoom = () => { };

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
                <div
                    id="remoteVideoContainer"
                    style={{
                        width: "100%",
                        height: "450px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#363636",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        position: "relative",
                    }}
                >
                    <video
                        id="remoteVideo"
                        ref={remoteVideoRef}
                        autoPlay
                        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "10px" }}
                    ></video>
                    <video
                        muted
                        id="localVideo"
                        ref={localVideoRef}
                        autoPlay
                        style={{
                            width: "150px",
                            height: "150px",
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            border: "2px solid #fff",
                            borderRadius: "10px",
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
                        }}
                    ></video>
                </div>

                <div className="d-flex justify-content-center" style={{ marginBottom: "20px" }}>
                    <button
                        id="toggleVideo"
                        className="btn-circle control-button"
                        onClick={() => toggleTrack("video")}
                        style={{
                            backgroundColor: "#007bff",
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
                    </button>
                    <button
                        id="toggleAudio"
                        className="btn-circle control-button"
                        onClick={() => toggleTrack("audio")}
                        style={{
                            backgroundColor: "#28a745",
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
