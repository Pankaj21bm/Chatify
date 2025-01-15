import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat";
import { ChatState } from "../context/chatProvider.js";
import { useMediaQuery } from "@chakra-ui/react";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();
  const [isMediumScreen] = useMediaQuery(
    "(min-width: 700px) and (max-width: 980px)"
  );

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDirection="column"
      pt={0}
      pl={"5px"}
      pr={"5px"}
      pb={"5px"}
      bg="white"
      width={{ base: "100%", md: isMediumScreen ? "59%" : "68%" }}
      borderRadius="lg"
      borderWidth="2px"
      boxShadow="0 0 10px #020161f1"
      overflowY="hidden"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;

