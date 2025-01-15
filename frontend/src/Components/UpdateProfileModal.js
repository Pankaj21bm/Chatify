import { AttachmentIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Image,
  useMediaQuery,
  FormControl,
  Input,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { ChatState } from "../context/chatProvider";
import React from "react";

const UpdateProfileModal = ({ user, fetchAgain, setFetchAgain, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSmallScreen] = useMediaQuery("(max-width: 576px)");
  const [isVerySmallScreen] = useMediaQuery("(max-width: 405px)");
  const [newName, setNewName] = useState("");
  const [picUploaded, setpicUploaded] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const [picUpdateLoading, setPicUpdateLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [photo, setPhoto] = useState("");
  const { setUser } = ChatState();
  const toast = useToast();


  const handleRename = async () => {
    if (!newName) return;

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/updatename`,
        {
          userId: user._id,
          userName: newName,
        },
        config
      );

      const storedData = JSON.parse(localStorage.getItem("userInfo"));
      storedData.name = data.name;
      localStorage.setItem("userInfo", JSON.stringify(storedData));
      setUser(storedData);
      setFetchAgain(!fetchAgain)
      setRenameLoading(false);
    } catch (error) {
      console.log(error)
      toast({
        title: "Error Occurred!",
        description: "Your User Name is not updated due to some internal error",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
    setNewName("");
  };


  const handlePicUpdate = async () => {
    if (!photo) {
      alert("Please Select an Image");
      return;
    }

    try {
      setPicUpdateLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/updatepicture`,
        {
          userId: user._id,
          userPhoto: photo,
        },
        config
      );

      const storedData = JSON.parse(localStorage.getItem("userInfo"));
      storedData.photo = data.photo;
      localStorage.setItem("userInfo", JSON.stringify(storedData));
      setUser(storedData);
      setFetchAgain(!fetchAgain)
      setPicUpdateLoading(false);
    } catch (error) {
      console.log(error)
      toast({
        title: "Error Occurred!",
        description: "Your User Name is not updated due to some internal error",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
      setPicUpdateLoading(false);
    }
    setSelectedFileName("");
  };

  const picUpload = (photo) => {
    setPicUpdateLoading(true);
    if (!photo) {
      alert("Please Select an Image");
      setPicUpdateLoading(false);
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
          setpicUploaded(true);
          setPicUpdateLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicUpdateLoading(false);
        });
    } else {
      alert("Please Select a valid Image");
      setSelectedFileName("")
      setPicUpdateLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const photo = event.target.files[0];
    if (photo) {
      setSelectedFileName(photo.name);
      picUpload(photo)
    } else {
      setSelectedFileName("");
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          bg={"transparent"}
          boxSize={5}
          onClick={onOpen}
          _hover={{ bg: "gray.300", transform: "scale(1.05)" }}
          transition="transform 0.2s"
        />
      )}
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered >
        <ModalOverlay />
        <ModalContent
          w="50%"
          borderRadius="lg"
          boxShadow="lg"
          transition="all 0.3s"
        >
          <ModalHeader
            fontSize={
              isSmallScreen ? (isVerySmallScreen ? "12px" : "15px") : "30px"
            }
            fontWeight="bold"
            display="flex"
            justifyContent="center"
            color="teal.500"
          >
            {user.name}
          </ModalHeader>
          <ModalCloseButton />


          <FormControl display="flex" justifyContent="center">
            <Input
              placeholder="Give new name"
              w={"60%"}
              mb={2}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              borderColor={"black"}
            />
            <Button
              variant="solid"
              bg={"#b601b37d"}
              color={"white"}
              ml={1}
              isLoading={renameLoading}
              onClick={handleRename}
              borderColor="black"
              fontSize={isSmallScreen ? "10px" : "15px"}
              width={isSmallScreen ? "10%" : "20%"}
            >
              Update
            </Button>
          </FormControl>


          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <div style={{ width:"100%",marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
              
              <label
                htmlFor="file-upload"
                style={{
                  cursor: "pointer",
                  border: "1px solid black",
                  borderRadius: "6px",
                  padding: "7px",
                  paddingLeft:"18px",
                  display: "inline-block",
                  textAlign: "start",
                  width: "60%",
                }}
              >
                <AttachmentIcon /> 
                <span style={{marginLeft:"8px"}}>
                  Select new Photo

                </span>
              </label>
              <Button
                variant="solid"
                bg={"#b601b37d"}
                color={"white"}
                ml={1}
                isLoading={picUpdateLoading}
                onClick={handlePicUpdate}
                borderColor="black"
                fontSize={isSmallScreen ? "10px" : "15px"}
                width={isSmallScreen ? "10%" : "20%"}
              >
                {picUploaded? "Update": "Upload"}
              </Button>
            </div>
            {selectedFileName && (
              <p style={{ fontSize: "sm", color: "black" }}>{selectedFileName}</p>
            )}
          </div>


          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
            p={4}
          >
            <Image
              borderRadius="full"
              boxSize={isSmallScreen ? "70px" : "150px"}
              src={user.photo}
              alt={user.name}
              boxShadow="md"
              transition="transform 0.3s"
              _hover={{ transform: "scale(1.05)" }}
            />

            <Text
              fontSize={
                isSmallScreen ? (isVerySmallScreen ? "12px" : "15px") : "18px"
              }
              fontWeight="bold"
              textAlign="center"
              mt={4}
              color="gray.700"
            >
              Email: {user.email}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={onClose}
              fontSize={isSmallScreen ? "10px" : "20px"}
              width={isSmallScreen ? "30%" : "20%"}
              colorScheme="teal"
              variant="solid"
              _hover={{ bg: "teal.600" }}
              transition="background-color 0.2s"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateProfileModal;