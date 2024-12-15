import React, { useEffect, useState } from "react";
import "./style.css";

function VideoGrid ({ participants, remoteStreams }) {
    const remoteVideos = [];
    const [remoteCount, setRemoteCount] = useState(0);

    useEffect(() => {
        setRemoteCount(Object.keys(remoteStreams).length);
        console.log("Maybe someone has left the chat ?", remoteStreams);
    }, [remoteStreams])

    // Duyệt qua remoteStreams
    if (remoteStreams != null && remoteCount > 0) {
        Object.values(remoteStreams).forEach((stream, index) => {
            if (!stream) return;
            remoteVideos.push(
                <video
                    key={`remote-${index}`}
                    className="remote-video"
                    autoPlay
                    playsInline
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                    }}
                    ref={(video) => {
                        if (video) {
                            video.srcObject = stream;
                        }
                    }}
                ></video>
            );
        });
    } else {
        remoteVideos.push(
            <div
                key="no-remote"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#1e1e1e",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "20px",
                }}
            >
                No remote streams
            </div>
        );
    }

    // Tính toán kích thước và bố cục lưới dựa trên số lượng remote videos
    let gridTemplateColumns = "1fr"; // Mặc định: 1 video chiếm toàn màn hình
    let gridHeight = "70vh"; // Chiều cao lưới mặc định
    if (remoteCount === 2) {
        gridTemplateColumns = "repeat(2, 1fr)"; // 2 video hiển thị song song
        gridHeight = "50vh"; // Giới hạn chiều cao
    } else if (remoteCount >= 3) {
        gridTemplateColumns = "repeat(auto-fit, minmax(200px, 1fr))"; // Responsive cho nhiều video
        gridHeight = "100%"; // Chiều cao full
    }

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
            }}
        >
            {/* Grid hiển thị remote video */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: gridTemplateColumns,
                    gap: "10px",
                    width: "100%",
                    height: gridHeight,
                }}
            >
                {remoteVideos}
            </div>

        </div>
    );
}

export default VideoGrid;
