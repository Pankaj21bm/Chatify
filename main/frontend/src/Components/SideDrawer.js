import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useMediaQuery,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../context/chatProvider.js";
import ProfileModal from "./ProfileModal.js";
import { useNavigate } from "react-router-dom";
import ChatLoading from "./ChatLoading.js";
import UserListItem from "./UserAvatar/UserListItem.js";
import { getSender } from "../config/ChatLogics.js";
import UpdateProfileModal from "./UpdateProfileModal.js";
import "./styles.css";

const SideDrawer = ({ fetchAgain, setFetchAgain }) => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const [isSmallScreen] = useMediaQuery("(max-width: 576px)");

  const {
    user,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async (search) => {
    if (!search) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error in fetching the chat",
        description: error.message,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
  }, [notification]);
  useEffect(() => {
    handleSearch(search);
  }, [search]);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="linear-gradient(90deg, #F2F2F2, #9CA6FF,#F2F2F2)"
        // w="98%"
        p="0.35rem 0.8rem"
        borderRadius="xl"
        boxShadow="0 5px 15px rgba(0, 0, 0, 0.2)"
        mt={2}
        ml={"1rem"}
        mr={"1rem"}
        // maxHeight={"7vh"}
      >
        {/* Search Button */}
        <Tooltip label="Search Users" hasArrow placement="bottom-end">
          <Button
            onClick={onOpen}
            variant="solid"
            bg={"green.400"}
            color={"white"}
            leftIcon={<FontAwesomeIcon icon={faSearch} />}
            _hover={{
              bg: "green.300",
            }}
            transition="all 0.1s"
          >
            Search User
          </Button>
        </Tooltip>

        {/* App Title */}
        <Text
          fontFamily="Poppins"
          fontSize={isSmallScreen ? "18px" : "28px"}
          fontWeight="bold"
          color="white"
        >
          Chatify
        </Text>

        {/* Notification and Profile */}
        <Box display="flex" alignItems="center" gap="20px">
          {/* Notifications */}
          <Menu>
            <MenuButton position="relative" aria-label="Notifications">
              {notification.length > 0 && (
                <Box
                  position="absolute"
                  top="-5px"
                  right="-5px"
                  bg="red.500"
                  color="white"
                  fontSize="12px"
                  fontWeight="bold"
                  w="20px"
                  h="20px"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {notification.length}
                </Box>
              )}
              <BellIcon boxSize={7} color="#000" />
            </MenuButton>
            <MenuList>
              {!notification.length ? (
                <MenuItem>No new messages</MenuItem>
              ) : (
                notification.map((notify) => (
                  <MenuItem
                    key={notify._id}
                    onClick={() => {
                      const updatedNotifications = notification.filter(
                        (n) => n.chat._id !== notify.chat._id
                      );
                      setNotification(updatedNotifications);
                      setSelectedChat(notify.chat);
                    }}
                    _hover={{ bg: "gray.100" }} // Add hover effect
                  >
                    {notify.chat.isGroupChat
                      ? `New message in ${notify.chat.chatName}`
                      : `New message from ${getSender(
                          user,
                          notify.chat.users
                        )}`}
                  </MenuItem>
                ))
              )}
            </MenuList>
          </Menu>

          {/* Profile Menu */}
          <Menu>
            <MenuButton>
              <Avatar size="sm" src={user.photo} name={user.name}>
                {" "}
              </Avatar>
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <UpdateProfileModal user={user} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}>
                <MenuItem>Update Profile</MenuItem>
              </UpdateProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      {/* Drawer */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg="gray.100">
          <DrawerHeader borderBottomWidth="1px">
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={onClose}
              variant="ghost"
              colorScheme="teal"
              mr={3}
            />
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Box display="flex" mb={4} gap={2}>
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg="white"
                borderRadius="md"
                focusBorderColor="teal.500"
              />
              <Button onClick={handleSearch} colorScheme="teal">
                Search
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Avatar,
//   Box,
//   Button,
//   Drawer,
//   DrawerBody,
//   DrawerContent,
//   DrawerHeader,
//   DrawerOverlay,
//   IconButton,
//   Input,
//   Menu,
//   MenuButton,
//   MenuDivider,
//   MenuItem,
//   MenuList,
//   Spinner,
//   Text,
//   Tooltip,
//   useDisclosure,
//   useMediaQuery,
//   useToast,
// } from "@chakra-ui/react";
// import { ArrowBackIcon } from "@chakra-ui/icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSearch } from "@fortawesome/free-solid-svg-icons";
// import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
// import { ChatState } from "../context/chatProvider.js";
// import ProfileModal from "./ProfileModal.js";
// import { useNavigate } from "react-router-dom";
// import ChatLoading from "./ChatLoading.js";
// import UserListItem from "./UserAvatar/UserListItem.js";
// import { getSender } from "../config/ChatLogics.js";
// import "./styles.css";

// const SideDrawer = () => {
//   const [search, setSearch] = useState("");
//   const [searchResult, setSearchResult] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [loadingChat, setLoadingChat] = useState();
//   const [isSmallScreen] = useMediaQuery("(max-width: 576px)");
//   const [isVerySmallScreen] = useMediaQuery("(max-width: 405px)");

//   const {
//     user,
//     selectedChat,
//     setSelectedChat,
//     chats,
//     setChats,
//     notification,
//     setNotification,
//   } = ChatState();

//   const navigate = useNavigate();
//   const { isOpen, onOpen, onClose } = useDisclosure();

//   const toast = useToast();

//   const logoutHandler = () => {
//     localStorage.removeItem("userInfo");
//     navigate("/");
//   };

//   const handleSearch = async (search) => {
//     if (!search) {
//       setSearchResult([]);
//       return;
//     }

//     try {
//       setLoading(true);

//       const config = {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//         },
//       };

//       const { data } = await axios.get(`/api/user?search=${search}`, config);

//       setLoading(false);
//       setSearchResult(data);
//     } catch (error) {
//       toast({
//         title: "Error Occurred!",
//         description: "Failed to Load the Search Results",
//         status: "error",
//         duration: 2000,
//         isClosable: true,
//         position: "bottom-left",
//       });
//     }
//   };

//   const accessChat = async (userId) => {
//     console.log("finding chats for the user id: ", userId);

//     try {
//       setLoadingChat(true);
//       const config = {
//         headers: {
//           "Content-type": "application/json",
//           Authorization: `Bearer ${user.token}`,
//         },
//       };
//       console.log(
//         "before accessing the chat from another user id from side drawer file"
//       );
//       const { data } = await axios.post(`/api/chat`, { userId }, config);
//       // console.log(data);

//       if (!chats.find((c) => c._id === data._id)) {
//         setChats([data, ...chats]);
//       }

//       setSelectedChat(data);
//       setLoadingChat(false);
//       onClose();
//     } catch (error) {
//       toast({
//         title: "Error in fetching the chat",
//         description: error.message,
//         status: "error",
//         duration: 2000,
//         isClosable: true,
//         position: "bottom-left",
//       });
//     }
//   };

//   useEffect(() => {
//     handleSearch(search);
//   }, [search]);

//   return (
//     <>
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         bg="white"
//         w="98.9%"
//         ml={"10px"}
//         mr={"10px"}
//         p="4px 0px 4px 0px"
//         borderRadius="lg"
//         borderWidth={"2px"}
//         mt={2}
//         boxShadow=" 0 0 5px #020161f1"
//       >
//         <Box display="flex">
//           <Tooltip label="Search Users" hasArrow placement="bottom-end">
//             <Button
//               variant={"ghost"}
//               borderRadius={"2xl"}
//               width={"100%"}
//               display="flex"
//               alignItems="center"
//               justifyContent="flex-start"
//               borderLeftRadius={0}
//               bg={"#020161f1"}
//               onClick={onOpen}
//             >
//               <FontAwesomeIcon icon={faSearch} style={{ color: "white" }} />
//               <Text
//                 display={isSmallScreen ? "none" : "flex"}
//                 px={isSmallScreen ? "5%" : "12%"}
//                 color={"white"}
//               >
//                 Search User
//               </Text>
//             </Button>
//           </Tooltip>
//         </Box>

//         <Text
//           fontFamily="Libre Baskerville"
//           fontSize={
//             isSmallScreen ? (isVerySmallScreen ? "10px" : "14px") : "25px"
//           }
//           fontWeight={"bold"}
//         >
//           Chatify
//         </Text>

//         <div>
//           <Menu>
//             {({ isOpen }) => (
//               <>
//                 <MenuButton
//                   p={1}
//                   m={1}
//                   isActive={isOpen}
//                   as={Button}
//                   style={{ background: "transparent" }}
//                 >
//                   <div>
//                     {notification.length > 0 && (
//                       <div className="notification-badge">
//                         <span className="badge">{notification.length}</span>
//                       </div>
//                     )}
//                   </div>

//                   <BellIcon boxSize={6} color={"blue.700"}></BellIcon>
//                 </MenuButton>

//                 <MenuList pl={2}>
//                   {!notification.length && "No new message"}
//                   {notification.map((notify) => (
//                     <MenuItem
//                       key={notify._id}
//                       style={{ cursor: "pointer" }}
//                       onClick={() => {
//                         setSelectedChat(notify.chat);
//                         console.log("hello");
//                         setNotification(
//                           notification.filter((n) => n !== notify)
//                         );
//                       }}
//                     >
//                       {notify.chat.isGroupChat
//                         ? `New message in ${notify.chat.chatName}`
//                         : `New message from ${getSender(
//                             user,
//                             notify.chat.users
//                           )}`}
//                     </MenuItem>
//                   ))}
//                 </MenuList>
//               </>
//             )}
//           </Menu>

//           <Menu>
//             <MenuButton
//               as={Button}
//               rightIcon={<ChevronDownIcon />}
//               style={{ background: "transparent" }}
//             >
//               <Avatar
//                 size="sm"
//                 cursor="pointer"
//                 src={user.photo}
//                 name={user.name}
//               >
//                 {" "}
//               </Avatar>
//             </MenuButton>

//             <MenuList>
//               <ProfileModal user={user}>
//                 <MenuItem>My Profile</MenuItem>{" "}
//               </ProfileModal>

//               <MenuDivider />

//               <MenuItem onClick={logoutHandler}>Logout</MenuItem>
//             </MenuList>
//           </Menu>
//         </div>
//       </Box>

//       <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
//         <DrawerOverlay />

//         <DrawerContent>
//           <DrawerHeader
//             borderBottomWidth="1px"
//             display={"flex"}
//             alignItems={"center"}
//             justifyContent="flex-start"
//           >
//             <IconButton
//               icon={<ArrowBackIcon boxSize={6} ml={0} />}
//               onClick={onClose}
//               bg={"transparent"}
//               variant={"ghost"}
//               mr={1}
//               mt={0}
//               color="blue.700"
//             />
//             Search Users
//           </DrawerHeader>

//           <DrawerBody>
//             <Box
//               display="flex"
//               borderRadius={"2xl"}
//               borderWidth={2}
//               borderColor={"blackAlpha.400"}
//               p={0}
//               mb={2}
//             >
//               <Input
//                 placeholder="Search by name or email"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 borderRightRadius={0}
//                 borderLeftRadius={"2xl"}
//                 p={0}
//                 pl={"5%"}
//                 _focus={{
//                   borderColor: "transparent",
//                   boxShadow: "0 0 10px #020161f1",
//                 }}
//               />
//               <Button
//                 bg={"#020161f1"}
//                 onClick={handleSearch}
//                 borderTopLeftRadius={0}
//                 borderBottomLeftRadius={0}
//                 borderRightRadius={"2xl"}
//                 p={0}
//               >
//                 <FontAwesomeIcon icon={faSearch} style={{ color: "white" }} />
//               </Button>
//             </Box>

//             {loading ? (
//               <ChatLoading />
//             ) : (
//               searchResult?.map((user) => (
//                 <UserListItem
//                   key={user._id}
//                   user={user}
//                   handleFunction={() => accessChat(user._id)}
//                 />
//               ))
//             )}

//             {loadingChat && <Spinner ml="auto" display="flex" />}
//           </DrawerBody>
//         </DrawerContent>
//       </Drawer>
//     </>
//   );
// };

// export default SideDrawer;
