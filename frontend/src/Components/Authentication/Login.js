import React, { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (shouldRefresh) {
      window.location.reload();
      setShouldRefresh(false);
    }
  }, [shouldRefresh]);

  const handleClick = () => setShow(!show);

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      alert("Please fill all the fields");
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/login`,
        { email, password },
        config
      );
      localStorage.setItem("userInfo", JSON.stringify(data));
      toast({
        title: "Success",
        description: "Login Successful...",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "bottom-center",
      });

      setTimeout(() => {
        setLoading(false);
        setShouldRefresh(true);
        navigate("/chat");
      }, 1000);
    } catch (error) {
      alert(`Error occurred: ${error.response.data.message}`);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "16px", width: "100%" }}>
        <label
          htmlFor="email"
          style={{ display: "block", marginBottom: "8px" }}
        >
          Email
          <span style={{ color: "red" }}>*</span>
        </label>
        <input
          type="email"
          id="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid black",
            borderRadius: "4px",
          }}
          required
        />
      </div>
      <div style={{ marginBottom: "16px", width: "100%" }}>
        <label
          htmlFor="password"
          style={{ display: "block", marginBottom: "8px" }}
        >
          Password
          <span style={{ color: "red" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={show ? "text" : "password"}
            id="password"
            placeholder="Enter Your Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid black",
              borderRadius: "4px",
            }}
            required
          />
          <button
            type="button"
            onClick={handleClick}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <button
        onClick={submitHandler}
        disabled={loading}
        style={{
          backgroundColor: "#45458e",
          color: "white",
          padding: "10px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          width: "70%",
          fontSize: "18px",
        }}
      >
        {loading ? "Loading..." : "Login"}
      </button>
    </div>
  );
};

export default Login;
