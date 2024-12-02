import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "./Profile.css";
import ImageSlider from "../components/ImageSlider";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { API } from "../../ipConfig";

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
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "default.png");
  const [email, setEmail] = useState(user?.email || "");

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

  return (
    <div className="profileform">
      <div className="content-form">
        <h2>HỒ SƠ CỦA TÔI</h2>
        <img src={photoURL} alt="Account" className="account-user" />
        <form className="profile-details-form">
          <div className="inputgroup">
            <b>Tên</b>
            {name}
          </div>
          <div className="inputgroup">
            <b>Email</b>
            {email}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
