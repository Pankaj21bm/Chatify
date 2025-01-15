import React, { useRef, useEffect, useState, memo } from "react";
import { ChatState } from "../context/chatProvider.js";
import { Avatar, Tooltip, Text as ChakraText, Spinner } from "@chakra-ui/react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics.js";
import debounce from 'lodash.debounce';


const ScrollableChat = ({ messages, fetchMessages, isAddedBefore }) => {
  const { user, selectedChat } = ChatState();
  const [offset, setOffset] = useState(50);
  const [loadingMore, setLoadingMore] = useState(false);
  const chatContainerRef = useRef();


  const handleScroll = async () => {
    if (
      chatContainerRef.current.scrollTop < 5 &&
      !loadingMore &&
      messages.length >= offset
    ) {
      setLoadingMore(true);
      const previousScrollHeight = chatContainerRef.current.scrollHeight;
      await fetchMessages(offset, true);
      setOffset((prevOffset) => prevOffset + 50);
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      chatContainerRef.current.scrollTop = newScrollHeight - previousScrollHeight;
      setLoadingMore(false);
    }
  };

  const debouncedHandleScroll = debounce(handleScroll, 300);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.removeEventListener("scroll", debouncedHandleScroll);
      container.addEventListener("scroll", debouncedHandleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", debouncedHandleScroll);
      }
    };
  }, [messages, selectedChat, debouncedHandleScroll]);

  useEffect(() => {
    if (!isAddedBefore && messages.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setOffset((prev) => prev + 1);
    }
  }, [messages]);

  useEffect(() => {
    setOffset(50);
    setLoadingMore(false);
    if (selectedChat) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [selectedChat]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div style={{ overflowY: "auto", height: "100%" }} ref={chatContainerRef}>
      {loadingMore && (
        <div style={{ textAlign: "center", margin: "10px 0" }}>
          <Spinner size="sm" />
        </div>
      )}
      {messages &&
        messages.map((message, ind) => (
          <div key={message._id}>
            {(ind === 0 ||
              (ind > 0 &&
                formatDate(message.createdAt) !==
                formatDate(messages[ind - 1].createdAt))) && (
                <div style={{ textAlign: "center", marginBottom: "10px" }}>
                  <ChakraText fontSize="15px" fontWeight="bold" color="gray.500">
                    {formatDate(message.createdAt)}
                  </ChakraText>
                </div>
              )}
            <div
              style={{
                display: "flex",
                whiteSpace: "pre-wrap",
                animation: "fadeIn 0.5s",
              }}
            >
              {(isSameSender(messages, message, ind, user._id) ||
                isLastMessage(messages, ind, user._id)) && (
                  <Tooltip
                    label={message.sender.name}
                    placement="bottom-start"
                    hasArrow
                  >
                    <Avatar
                      mt="7px"
                      mr={1}
                      size="sm"
                      cursor="pointer"
                      name={message.sender.name}
                      src={message.sender.photo}
                      border="1px solid #32916E"
                      transition="transform 0.3s"
                    />
                  </Tooltip>
                )}
              <span
                style={{
                  backgroundColor: `${message.sender._id === user._id ? "#d9fdd3" : "#ffffff"}`,
                  color: message.sender._id === user._id ? "#171b16" : "#5a5a5a",
                  marginLeft: isSameSenderMargin(messages, message, ind, user._id),
                  marginRight: "1px",
                  marginTop: isSameUser(messages, message, ind, user._id) ? 3 : 10,
                  borderRadius: `10px ${message.sender._id === user._id ? "0px" : "10px"} 10px ${message.sender._id === user._id ? "10px" : "0px"}`,
                  padding: "3px 10px",
                  marginBottom: (ind == messages.length - 1) ? "5px" : "0px",
                  maxWidth: "75%",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  position: "relative",
                  overflow: "hidden",
                }}
                dangerouslySetInnerHTML={{ __html: message.content }}
              />
              <ChakraText
                fontSize="10px"
                color="gray.500"
                marginLeft={"2px"}
                mt={2}
                mr={1}
                alignSelf="flex-end"
              >
                {formatTimestamp(message.createdAt)}
              </ChakraText>
            </div>
          </div>
        ))}
    </div>
  );
};

export default React.memo(ScrollableChat);

// import React, { useRef, useEffect, useState } from "react";
// import ScrollableFeed from "react-scrollable-feed";
// import { ChatState } from "../context/chatProvider.js";
// import { Avatar, Tooltip, Text as ChakraText, Spinner } from "@chakra-ui/react";
// import {
//   isLastMessage,
//   isSameSender,
//   isSameSenderMargin,
//   isSameUser,
// } from "../config/ChatLogics.js";
// import debounce from 'lodash.debounce';

// const ScrollableChat = ({ messages, fetchMessages }) => {
//   const { user } = ChatState();
//   const [offset, setOffset] = useState(50); // Start with the first 50 messages
//   const [loadingMore, setLoadingMore] = useState(false);
//   const scrollableFeedRef = useRef(null);

//   const handleScroll = async () => {
//     const container = scrollableFeedRef.current;
//     if (
//       container.scrollTop === 0 && // User scrolled to the top
//       !loadingMore &&
//       messages.length >= offset
//     ) {
//       setLoadingMore(true);
//       const previousScrollHeight = container.scrollHeight; // Save current scroll height
//       await fetchMessages(offset, true); // Fetch previous messages
//       setOffset((prevOffset) => prevOffset + 50);
//       const newScrollHeight = container.scrollHeight; // Get new scroll height
//       container.scrollTop = newScrollHeight - previousScrollHeight; // Maintain scroll position
//       setLoadingMore(false);
//     }
//   };

//   //   // Debounce the handleScroll function
//     const debouncedHandleScroll = debounce(handleScroll, 200);

//     const formatTimestamp = (timestamp) => {
//       const date = new Date(timestamp);
//       return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//     };

//     const formatDate = (timestamp) => {
//       const date = new Date(timestamp);
//       return date.toLocaleDateString([], {
//         day: "numeric",
//         month: "short",
//         year: "numeric",
//       });
//     };

//   return (
//     <div
//       style={{ height: "100%", overflowY: "auto", position: "relative" }}
//       ref={scrollableFeedRef}
//     >
//       {loadingMore && (
//         <div style={{ textAlign: "center", margin: "10px 0" }}>
//           <Spinner size="sm" />
//         </div>
//       )}
//       <ScrollableFeed onScroll={debouncedHandleScroll}>
//         {messages &&
//           messages.map((message, ind) => (
//             <div key={message._id}>
//               {(ind === 0 ||
//                 (ind > 0 &&
//                   formatDate(message.createdAt) !==
//                   formatDate(messages[ind - 1].createdAt))) && (
//                   <div style={{ textAlign: "center", marginBottom: "10px" }}>
//                     <ChakraText fontSize="15px" fontWeight="bold" color="gray.500">
//                       {formatDate(message.createdAt)}
//                     </ChakraText>
//                   </div>
//                 )}
//               <div
//                 style={{
//                   display: "flex",
//                   whiteSpace: "pre-wrap",
//                   animation: "fadeIn 0.5s",
//                 }}
//               >
//                 {(isSameSender(messages, message, ind, user._id) ||
//                   isLastMessage(messages, ind, user._id)) && (
//                     <Tooltip
//                       label={message.sender.name}
//                       placement="bottom-start"
//                       hasArrow
//                     >
//                       <Avatar
//                         mt="7px"
//                         mr={1}
//                         size="sm"
//                         cursor="pointer"
//                         name={message.sender.name}
//                         src={message.sender.photo}
//                         border="1px solid #32916E"
//                         transition="transform 0.3s"
//                       />
//                     </Tooltip>
//                   )}
//                 <span
//                   style={{
//                     backgroundColor: `${message.sender._id === user._id ? "#d9fdd3" : "#ffffff"}`,
//                     color: message.sender._id === user._id ? "#171b16" : "#5a5a5a",
//                     marginLeft: isSameSenderMargin(messages, message, ind, user._id),
//                     marginRight: "1px",
//                     marginTop: isSameUser(messages, message, ind, user._id) ? 3 : 10,
//                     borderRadius: `10px ${message.sender._id === user._id ? "0px" : "10px"} 10px ${message.sender._id ? "10px" : "0px"}`,
//                     padding: "3px 10px",
//                     maxWidth: "75%",
//                     boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
//                     position: "relative",
//                     overflow: "hidden",
//                   }}
//                   dangerouslySetInnerHTML={{ __html: message.content }}
//                 />
//                 <ChakraText
//                   fontSize="10px"
//                   color="gray.500"
//                   marginLeft={"2px"}
//                   mt={2}
//                   mr={1}
//                   alignSelf="flex-end"
//                 >
//                   {formatTimestamp(message.createdAt)}
//                 </ChakraText>
//               </div>
//             </div>
//           ))}
//       </ScrollableFeed>
//     </div>
//   );
// };

// export default ScrollableChat;


// import React, { useRef, useEffect, useState } from "react";
// import { ChatState } from "../context/chatProvider.js";
// import { Avatar, Tooltip, Text as ChakraText, Spinner } from "@chakra-ui/react";
// import {
//   isLastMessage,
//   isSameSender,
//   isSameSenderMargin,
//   isSameUser,
// } from "../config/ChatLogics.js";
// import debounce from 'lodash.debounce'; // Import debounce from lodash

// const ScrollableChat = ({ messages, fetchMessages }) => {
//   const { user } = ChatState();
//   const [offset, setOffset] = useState(50); // Start with the first 50 messages
//   const [loadingMore, setLoadingMore] = useState(false);
//   const chatContainerRef = useRef();

//   const handleScroll = async () => {
//     // Check if the user has scrolled to the top
//     if (
//       chatContainerRef.current.scrollTop < 5 && // Check if close to the top
//       !loadingMore &&
//       messages.length >= offset
//     ) {
//       setLoadingMore(true);
//       const previousScrollHeight = chatContainerRef.current.scrollHeight; // Get the current scroll height
//       await fetchMessages(offset, true); // Pass `true` for pagination
//       setOffset((prevOffset) => prevOffset + 50);
//       const newScrollHeight = chatContainerRef.current.scrollHeight; // Get the new scroll height
//       chatContainerRef.current.scrollTop = newScrollHeight - previousScrollHeight; // Adjust scroll position
//       setLoadingMore(false);
//     }
//   };

//   // Debounce the handleScroll function
//   const debouncedHandleScroll = debounce(handleScroll, 200);

//   useEffect(() => {
//     const container = chatContainerRef.current;
//     if (container) {
//       container.addEventListener("scroll", debouncedHandleScroll);
//       return () => container.removeEventListener("scroll", debouncedHandleScroll);
//     }
//   }, [messages]);

//   const formatTimestamp = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   const formatDate = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleDateString([], {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   return (
//     <div style={{ overflowY: "auto", height: "100%" }} ref={chatContainerRef}>
//       {loadingMore && (
//         <div style={{ textAlign: "center", margin: "10px 0" }}>
//           <Spinner size="sm" />
//         </div>
//       )}
//       {messages &&
//         messages.map((message, ind) => (
//           <div key={message._id}>
//             {(ind === 0 ||
//               (ind > 0 &&
//                 formatDate(message.createdAt) !==
//                 formatDate(messages[ind - 1].createdAt))) && (
//                 <div style={{ textAlign: "center", marginBottom: "10px" }}>
//                   <ChakraText fontSize="15px" fontWeight="bold" color="gray.500">
//                     {formatDate(message.createdAt)}
//                   </ChakraText>
//                 </div>
//               )}
//             <div
//               style={{
//                 display: "flex",
//                 whiteSpace: "pre-wrap",
//                 animation: "fadeIn 0.5s",
//               }}
//             >
//               {(isSameSender(messages, message, ind, user._id) ||
//                 isLastMessage(messages, ind, user._id)) && (
//                   <Tooltip
//                     label={message.sender.name}
//                     placement="bottom-start"
//                     hasArrow
//                   >
//                     <Avatar
//                       mt="7px"
//                       mr={1}
//                       size="sm"
//                       cursor="pointer"
//                       name={message.sender.name}
//                       src={message.sender.photo}
//                       border="1px solid #32916E"
//                       transition="transform 0.3s"
//                     />
//                   </Tooltip>
//                 )}
//               <span
//                 style={{
//                   backgroundColor: `${message.sender._id === user._id ? "#d9fdd3" : "#ffffff"}`,
//                   color: message.sender._id === user._id ? "#171b16" : "#5a5a5a",
//                   marginLeft: isSameSenderMargin(messages, message, ind, user._id),
//                   marginRight: "1px",
//                   marginTop: isSameUser(messages, message, ind, user._id) ? 3 : 10,
//                   borderRadius: `10px ${message.sender._id === user._id ? "0px" : "10px"} 10px ${message.sender._id === user._id ? "10px" : "0px"}`,
//                   padding: "3px 10px",
//                   maxWidth: "75%",
//                   boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
//                   position: "relative",
//                   overflow: "hidden",
//                 }}
//                 dangerouslySetInnerHTML={{ __html: message.content }}
//               />
//               <ChakraText
//                 fontSize="10px"
//                 color="gray.500"
//                 marginLeft={"2px"}
//                 mt={2}
//                 mr={1}
//                 alignSelf="flex-end"
//               >
//                 {formatTimestamp(message.createdAt)}
//               </ChakraText>
//             </div>
//           </div>
//         ))}
//     </div>
//   );
// };

// export default ScrollableChat;


// import ScrollableFeed from "react-scrollable-feed";
// import { ChatState } from "../context/chatProvider.js";
// import { Avatar, Tooltip, Text as ChakraText } from "@chakra-ui/react";
// import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser, } from "../config/ChatLogics.js";

// const ScrollableChat = ({ messages }) => {
//   const { user } = ChatState();

//   const formatTimestamp = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   const formatDate = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric", });
//   };

//   return (
//     <ScrollableFeed>
//       {messages &&
//         messages.map((message, ind) => {
//           return (
//             <div key={message._id}>
//                 {(ind === 0 ||
//                   (ind > 0 &&
//                     formatDate(message.createdAt) !==
//                     formatDate(messages[ind - 1].createdAt))) && (
//                     <div
//                       style={{ textAlign: "center", marginBottom: "10px" }}
//                     >
//                       <ChakraText
//                         fontSize="15px"
//                         fontWeight="bold"
//                         color="gray.500"
//                       >
//                         {formatDate(message.createdAt)}
//                       </ChakraText>
//                     </div>
//                   )}
//               <div
//                 style={{
//                   display: "flex",
//                   whiteSpace: "pre-wrap",
//                   animation: "fadeIn 0.5s",
//                 }}
//               >
//                 {(isSameSender(messages, message, ind, user._id) ||
//                   isLastMessage(messages, ind, user._id)) && (
//                     <Tooltip
//                       label={message.sender.name}
//                       placement="bottom-start"
//                       hasArrow
//                     >
//                       <Avatar
//                         mt="7px"
//                         mr={1}
//                         size="sm"
//                         cursor="pointer"
//                         name={message.sender.name}
//                         src={message.sender.photo}
//                         border="1px solid #32916E"
//                         transition="transform 0.3s"
//                       />
//                     </Tooltip>
//                   )}
//                 <span
//                   style={{
//                     backgroundColor: `${message.sender._id === user._id ? "#d9fdd3" : "#ffffff"}`,
//                     color: message.sender._id === user._id ? "#171b16" : "#5a5a5a",
//                     marginLeft: isSameSenderMargin(messages, message, ind, user._id),
//                     marginRight: "1px",
//                     marginTop: isSameUser(messages, message, ind, user._id) ? 3 : 10,
//                     borderRadius: `10px ${message.sender._id === user._id ? "0px" : "10px"} 10px ${message.sender._id === user._id ? "10px" : "0px"}`,
//                     padding: "3px 10px",
//                     maxWidth: "75%",
//                     boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
//                     position: "relative",
//                     overflow: "hidden",
//                   }}
//                   dangerouslySetInnerHTML={{ __html: message.content }}
//                 />
//                 <ChakraText
//                   fontSize="10px"
//                   color="gray.500"
//                   marginLeft={"2px"}
//                   mt={2}
//                   mr={1}
//                   alignSelf="flex-end"
//                 >
//                   {formatTimestamp(message.createdAt)}
//                 </ChakraText>
//               </div>
//             </div>
//           );
//         })}
//     </ScrollableFeed>
//   );
// };

// export default ScrollableChat;