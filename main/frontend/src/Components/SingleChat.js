import {
  FormControl,
  Input,
  Textarea,
  Box,
  Text,
  Button,
  IconButton,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import ProfileModal from "./ProfileModal.js";
import UpdateGroupChatModal from "./UpdateGroupChatModal.js";
import { ChatState } from "../context/chatProvider.js";
import ScrollableChat from "./ScrollableChat";
import SpeechToText from "./SpeectToText.js";
import io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const ENDPOINT = "http://localhost:5000";
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [isAddedBefore, setIisAddedBefore] = useState(true);
  const toast = useToast();

  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();

  const handleSpeechResult = (result) => {
    setNewMessage(result);
  };

  const fetchMessages = useCallback(async (offset = 0, isPagination = false) => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}?limit=50&offset=${offset}`,
        config
      );

      if (data.length === 0)
        console.log("Congretulations! all the chats have been scrolled up...");
      if (isPagination) {
        setMessages((prevMessages) => [...data, ...prevMessages]);
        setIisAddedBefore(true);
        console.log("ispagination true");
      } else {
        setMessages(data);
        // setIisAddedBefore(false);
        console.log("ispagination false");
        socket.emit("join chat", selectedChat._id);
      }
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: "Failed to Load the Messages haha",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
    }
  }, [selectedChat, user, toast]);

  const memoizedMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    if (!selectedChat) return;
    setNewMessage("");
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat, user]);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const messageContentWithNewlines = newMessage.replace(/\n/g, "<br>");

        const { data } = await axios.post(
          "/api/message",
          {
            content: messageContentWithNewlines,
            chatId: selectedChat,
          },
          config
        );

        socket.emit("new message", data);
        setNewMessage("");
        setIisAddedBefore(false);
        setMessages([...messages, data]);
        setFetchAgain(!fetchAgain);
      } catch (error) {
        toast({
          title: "Error Occurred",
          description: "Failed to send the Message",
          status: "error",
          duration: 2000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    if (!socketConnected) {
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
    }
  }, [user, socketConnected]);

  const handleStartTyping = (chat) => {
    if (!selectedChat) {
      setIsTyping(false);
    } else if (selectedChat._id !== chat._id) {
      setIsTyping(false);
    } else {
      setIsTyping(true);
    }
  };

  const handleStopTyping = (chatId) => {
    setIsTyping(false);
  };

  useEffect(() => {
    socket.on("typing", handleStartTyping);
    socket.on("stop typing", handleStopTyping);
    return () => {
      socket.off("typing", handleStartTyping);
      socket.off("stop typing", handleStopTyping);
    };
  }, [selectedChat]);

  const handleNewMessage = (newMessageReceived) => {
    console.log("new  message received: ", newMessageReceived);
    if (
      !selectedChat ||
      (selectedChat && selectedChat._id !== newMessageReceived.chat._id)
    ) {
      console.log("enterend to push notifications:");
      setNotification((prevNotifications) => {
        if (
          !prevNotifications.some((msg) => msg._id === newMessageReceived._id)
        ) {
          return [newMessageReceived, ...prevNotifications];
        }
        return prevNotifications;
      });
      setFetchAgain((prev) => !prev);
    } else {
      setMessages((prevMessages) => {
        console.log("Adding to messages:");
        return [...prevMessages, newMessageReceived];
      });
      setFetchAgain((prev) => !prev);
    }
  };

  useEffect(() => {
    socket.on("message received", handleNewMessage);
    return () => {
      socket.off("message received", handleNewMessage);
    };
  }, [selectedChat]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;
    const roomId = selectedChat?._id;
    if (!typing && roomId) {
      setTyping(true);
      socket.emit("typing", selectedChat);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 1000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        sendMessage();
      }
    }
  };

  const countNewlines = (str) => {
    return (str.match(/\n/g) || []).length; // returns the number of newlines in the string
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "20px", md: "22px" }}
            pb={1}
            pt={0}
            px={2}
            w="100%"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            bg={"#419fd9"}
            bgClip="text"
            fontWeight="bold"
            letterSpacing="normal"
            transition="transform 0.1s"
          >
            <IconButton
              // display={{ base: "flex", md: "none" }}
              display={{ base: "flex" }}
              icon={<ArrowBackIcon boxSize={6} />}
              bg={"transparent"}
              color="blue.700"
              onClick={() => setSelectedChat("")}
            />
            {messages && !selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p={3}
            pt={1}
            pr={0}
            pl={2}
            bg="#ece5dd"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="auto"
            backgroundImage="url('../assets/bigdoodle.jpg')"
            backgroundSize="cover"
            backgroundRepeat="repeat"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "hidden",
                }}
                className="chat-container"
              >
                  <ScrollableChat
                    messages={memoizedMessages}
                    fetchMessages={fetchMessages}
                    isAddedBefore={isAddedBefore}
                  />

              </div>
            )}
            {istyping && <div style={{width:'20%', background:"transparent"}}>typing..</div>}
            <FormControl
              display={"flex"}
              mt={3}
              alignItems={"center"}
              isRequired
            >
              <Textarea
                bg="white"
                placeholder="Message.."
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={handleKeyDown}
                borderRadius={"20px"}
                minHeight="48px" // Adjust the minimum height as needed
                resize="none"
                rows={
                  countNewlines(newMessage) === 0
                    ? 1
                    : countNewlines(newMessage) <= 3
                    ? countNewlines(newMessage)
                    : 3
                }
              />
              <SpeechToText onSpeechResult={handleSpeechResult} />
              <Button
                bg={"#075e54"}
                onClick={sendMessage}
                borderRadius={"50%"}
                p={0}
                ml={1}
              >
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  style={{ color: "white" }}
                />
              </Button>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3}>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
