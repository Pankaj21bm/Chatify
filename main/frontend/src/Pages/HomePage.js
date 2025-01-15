import React, { useEffect, useState, useRef } from "react";
import Login from "../Components/Authentication/Login";
import Signup from "../Components/Authentication/Signup";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("login"); // Define activeTab state
  const myRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/chat");
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", margin: 0 }} ref={myRef}>
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "16px",
            backgroundColor: "white",
            width: "100%",
            margin: "10px 0",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h1
            style={{
              fontFamily: "Libre Baskerville",
              fontSize: "2rem",
              textAlign: "center",
            }}
          >
            Chatify
          </h1>
        </div>
        <div
          style={{
            width: "100%",
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid black",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ marginBottom: "10px", display: "flex" }}>
            <button
              style={{
                width: "49%",
                fontFamily: "Libre Baskerville",
                padding: "10px",
                backgroundColor: "blue",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginLeft: "1%",
              }}
              onClick={() => setActiveTab("signup")}
            >
              {" "}
              Sign Up
            </button>
            <button
              style={{
                width: "49%",
                fontFamily: "Libre Baskerville",
                padding: "10px",
                backgroundColor: "blue",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginLeft: "1%",
              }}
              onClick={() => setActiveTab("login")}
            >
              {" "}
              Login
            </button>

          </div>
          {activeTab === "login" ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
