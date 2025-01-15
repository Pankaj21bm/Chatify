import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChatState } from "../context/chatProvider";

import { Box, Button, Stack, Text, useMediaQuery, useToast, } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading.js";
import { getSender } from "../config/ChatLogics.js";
import GroupChatModal from "./GroupChatModal.js";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const [isVerySmallScreen] = useMediaQuery("(max-width: 300px)");
  const [isSmallScreen] = useMediaQuery("(max-width: 405px)");
  const [isMediumScreen] = useMediaQuery(
    "(min-width: 700px) and (max-width:980px)"
  );

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat`,
        config
      );
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: "Failed to Load the chats",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain, selectedChat]); //add fetch chats into this

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: isMediumScreen ? "40%" : "31%" }}
      borderRadius="lg"
      borderWidth={"2px"}
      boxShadow=" 0 0 10px #020161f1"
      h={"100%"}
    >
      <Box
        pb={3}
        px={2}
        fontSize={
          isSmallScreen
            ? isVerySmallScreen
              ? "15px"
              : "20px"
            : isMediumScreen
              ? "25px"
              : "30px"
        }
        display={"flex"}
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display={"flex"}
            fontSize={isVerySmallScreen ? "12px" : "15px"}
            rightIcon={<AddIcon />}
            bg={"green.400"}
            color={"white"}
            _hover={{ bg: "green.300" }}
          >
            New Group
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#EDEDED"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="auto"
      >
        {chats ? (
          <Stack>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat?._id === chat?._id ? "#419fd9" : "#fff"}
                color={selectedChat?._id === chat?._id ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text
                    fontSize="xs"
                    whiteSpace="pre-line"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content
                      .replace(/<br>/g, "\n")
                      .split("\n")[0]
                      .substring(0, 47)}
                    {chat.latestMessage.content.length > 47 && " ..."}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
