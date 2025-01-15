import React, { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePasswordLength = (password) => {
    const minLength = 8;
    return password.length >= minLength;
  };

  const validatePasswordCharacter = (password) => {
    const specialCharacterRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/;
    return specialCharacterRegex.test(password);
  };

  const picUpload = (photo) => {
    setLoading(true);
    if (!photo) {
      alert("Please Select an Image");
      setLoading(false);
      return;
    }
    if (
      photo.type === "image/jpeg" ||
      photo.type === "image/png" ||
      photo.type === "image.jpg"
    ) {
      const data = new FormData();

      data.append("file", photo);
      data.append("upload_preset", process.env.REACT_APP_UPLOAD_PRESET);
      data.append("cloud_name", process.env.REACT_APP_CLOUD_NAME);
      fetch(process.env.REACT_APP_IMAGE_API, {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPhoto(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      alert("Please Select a valid Image");
      setLoading(false);
    }
  };

  const submitHandler = async () => {
    setLoading(true);
    if (name.trim() === "") {
      alert("Please enter a valid name");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      alert("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!validatePasswordLength(password)) {
      alert("Password Should Be At least 8 Characters Long");
      setLoading(false);
      return;
    }
    if (!validatePasswordCharacter(password)) {
      alert("Password Should Contain At least One Special Character");
      setLoading(false);
      return;
    }
    if (!name || !email || !password || !confirmpassword) {
      alert("Please Enter All the Required Fields");
      setLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      alert("Passwords Do Not Match");
      setLoading(false);
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const body = { name, email, password, photo };
      const host = "https://chatify-backend-2eyg.onrender.com";

      const { data } = await axios.post(
        `${host}/api/user`,
        body, config );

      toast({
        title: "Registration Succussful...",
        description: "Registration Succussful...",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "bottom-center",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));

      setTimeout(() => {
        setLoading(false);
        setShouldRefresh(true);
        navigate("/chat");
      }, 1000);
    } catch (error) {
      console.log(error);
      alert("Some Error Occurred!");
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const photo = event.target.files[0];
    if (photo) {
      setSelectedFileName(photo.name);
      picUpload(photo);
    } else {
      setSelectedFileName("");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="name" style={{ display: "block", marginBottom: "8px" }}>
          {" "}
          Name
          <span style={{ color: "red" }}>*</span>
        </label>
        <input
          type="text"
          id="name"
          placeholder="Enter Your Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid black",
            borderRadius: "4px",
          }}
          required
        />
      </div>
      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="email"
          style={{ display: "block", marginBottom: "8px" }}
        >
          {" "}
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
      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="password"
          style={{ display: "block", marginBottom: "8px" }}
        >
          {" "}
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
      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="confirmpassword"
          style={{ display: "block", marginBottom: "8px" }}
        >
          {" "}
          Confirm Password
          <span style={{ color: "red" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={show ? "text" : "password"}
            id="confirmpassword"
            placeholder="Confirm Your Password"
            value={confirmpassword}
            onChange={(event) => setConfirmpassword(event.target.value)}
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
            {" "}
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="file-upload"
          style={{ display: "block", marginBottom: "8px" }}
        >
          Upload Your Profile Photo
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <label
          htmlFor="file-upload"
          style={{
            cursor: "pointer",
            border: "1px solid black",
            borderRadius: "4px",
            padding: "10px",
            display: "inline-block",
            textAlign: "center",
            width: "100%",
          }}
        >
          Select File
        </label>
        {selectedFileName && (
          <p style={{ fontSize: "sm", color: "black" }}>{selectedFileName}</p>
        )}
      </div>
      <button
        onClick={submitHandler}
        disabled={loading}
        style={{
          backgroundColor: "black",
          color: "white",
          padding: "10px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          width: "100%",
          fontSize: "18px",
        }}
      >
        {loading ? "Loading..." : "Sign Up"}
      </button>
    </div>
  );
};

export default Signup;
