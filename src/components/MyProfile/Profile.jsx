import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "./Profile.css";
import ImageSlider from "../components/ImageSlider";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { API } from "../../ipConfig";
import { FaEdit } from "react-icons/fa"; // Import icon

function Profile() {
  const info = useAuth();
  const navigate = useNavigate();

  if (info.loading) {
    return <div>Loading...</div>;
  }

  if (!info.user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="home">
      <Sidebar info={info} />
      <MyProfile user={info.user} />
      <ImageSlider />
    </div>
  );
}

const MyProfile = ({ user }) => {
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const url = `${API}findById?Id=${user?.uid}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("User data fetch failed");

        const data = await response.json();
        setName(data.fullname || user.fullname);
        setPhotoURL(data.photoURL || user.photoURL);
        setEmail(data.email || user.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (user?.uid) {
      fetchUserData();
    }
  }, [user]);
  const handleUpdate = async () => {
    const updatedUser = {
      uid: user?.uid,
      fullname: name,
      email: email,
      photoURL: photoURL,
    };

    try {
      const response = await fetch(`${API}updateUser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User updated successfully:", data);
        alert("Caapj nhat thanh cong");
      } else {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };
  return (
    <div className="profileform">
      <div className="content-form">
        <h2>HỒ SƠ CỦA TÔI</h2>
        <img src={photoURL} alt="Account" className="account-user" />
        <form className="profile-details-form">
          <div className="inputgroup">
            <div className="form-label">Tên</div>
            <input
              type="text"
              className="formcontrol"
              value={name}
              readOnly={!isEditing}
              onChange={(e) => setName(e.target.value)}
            ></input>
            <FaEdit className="edit-icon" onClick={() => setIsEditing(true)} />
          </div>
          <div className="inputgroup">
            <div className="form-label">Email</div>
            <input
              type="text"
              className="formcontrol"
              value={email}
              readOnly={!isEditing}
              onChange={(e) => setEmail(e.target.value)}
            ></input>
            <FaEdit className="edit-icon" onClick={() => setIsEditing(true)} />
          </div>
          {isEditing && (
            <button
              type="button"
              className="save-button"
              onClick={handleUpdate}
            >
              Lưu
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
