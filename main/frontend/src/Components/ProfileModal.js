import { ViewIcon } from "@chakra-ui/icons";
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
} from "@chakra-ui/react";
import React, { useState } from "react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSmallScreen] = useMediaQuery("(max-width: 576px)");
  const [isVerySmallScreen] = useMediaQuery("(max-width: 405px)");
  const [name, setName] = useState("");
  
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
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
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

export default ProfileModal;



// import { ViewIcon } from "@chakra-ui/icons";
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   ModalCloseButton,
//   Button,
//   useDisclosure,
//   IconButton,
//   Text,
//   Image,
//   useMediaQuery,
// } from "@chakra-ui/react";

// const ProfileModal = ({ user, children }) => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [isSmallScreen] = useMediaQuery("(max-width: 576px)");
//   const [isVerySmallScreen] = useMediaQuery("(max-width: 405px)");
//   return (
//     <>
//       {children ? (
//         <span onClick={onOpen}>{children}</span>
//       ) : (
//         <IconButton
//           display={{ base: "flex" }}
//           icon={<ViewIcon />}
//           bg={"transparent"}
//           onClick={onOpen}
//         />
//       )}
//       <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
//         <ModalOverlay />
//         <ModalContent h={isSmallScreen ? "40%" : "50%"} w="50%">
//           <ModalHeader
//             fontSize={
//               isSmallScreen ? (isVerySmallScreen ? "12px" : "15px") : "30px"
//             }
//             fontWeight="bold"
//             // fontFamily="Work sans"
//             display="flex"
//             justifyContent="center"
//           >
//             {user.name}
//           </ModalHeader>
//           <ModalCloseButton />
//           <ModalBody
//             display="flex"
//             flexDir="column"
//             alignItems="center"
//             justifyContent="space-between"
//           >
//             <Image
//               borderRadius="full"
//               boxSize={isSmallScreen ? "70px" : "150px"}
//               src={user.photo}
//               alt={user.name}
//             />
//             <Text
//               fontSize={
//                 isSmallScreen ? (isVerySmallScreen ? "12px" : "15px") : "18px"
//               }
//               fontWeight="bold"
//             >
//               Email: {user.email}
//             </Text>
//           </ModalBody>
//           <ModalFooter>
//             <Button
//               onClick={onClose}
//               fontSize={isSmallScreen ? "10px" : "20px"}
//               width={isSmallScreen ? "10%" : "20%"}
//             >
//               Close
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// };

// export default ProfileModal;