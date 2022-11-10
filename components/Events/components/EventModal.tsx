import { getUserDetailsByEmail } from "@/supabase/userDetails";
import validateEmail from "@/utils/validateEmail";
import {
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Modal,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
  ModalHeader,
  VStack,
  Text,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { GiConfirmed } from "react-icons/gi";
import { eventTabs } from "../utils/tier";
import mixpanel from 'mixpanel-browser';
import * as ga from "@/utils/ga";
import router, { useRouter } from "next/router";

type Any = {
  [key: string]: string | number | boolean | undefined | null;
};

interface EventModalProps {
  isOpen: boolean;
  data: Any;
  paymentCallback?: () => Promise<void>;
  callback?: (value: any) => void;
  onClose: () => void;
}
const EventModal = (props: EventModalProps) => {
  const toast = useToast();
  const { isOpen, onClose, callback, paymentCallback } = props;

  const [screen, setScreen] = useState<string>("email");
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState({
    email: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  // const router = useRouter();

  const quantity = props.data.quantity as number;
  const type_id = props.data.ticketType as number;
  const event_id = props.data.ticketId as number;

  const ticket_type = eventTabs.find((tab) => tab.id === type_id);

  // console.log(router.query.id)


  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!email) {
      setErrorMessage({
        email: "Your Email is required",
      });
      return;
    }
    const valid = validateEmail(email);
    if (!valid) {
      toast({
        position: "top",
        description: "Invalid email",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setErrorMessage({
        email: "Invalid Email",
      });
      return;
    } else {
      if (email) {
        // callback &&
        //   callback({
        //     email,
        //   });
        await handlePurchase(quantity, ticket_type?.price || 50, event_id, type_id) 

        // setScreen("payment");
      }
    }
  };

  async function handlePurchase(purchaseQuantity: number, price: number, event_id: number, ticket_type_id: number) {
    setSubmitting(true)


    const { data: userData, error: userError } = await getUserDetailsByEmail(
      email.toLowerCase()
    );

    if (!userData) {
      // user doesn't exist, create an account
      const createRes = await fetch(`/api/admin/create-user`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        credentials: "same-origin",
        body: JSON.stringify({
          email: email.toLowerCase(),
        }),
      })
        .then((res) => res.json())
        .catch((err) => {
          console.log(err);
          toast({
            position: "top",
            description: err.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          return {
            user: null,
            error: true,
          };
        });
    }

    const { data: confirmedUserData, error: confirmedError } =
      await getUserDetailsByEmail(email.toLowerCase());

    if (!confirmedUserData) {
      toast({
        position: "top",
        description: "Error accessing your account - please contact support@verifiedink.us",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setSubmitting(false);

    }
    mixpanel.people.set({
      $email: email.toLowerCase()
    });



    ga.event({
      action: "conversion",
      params: {
        send_to: 'AW-10929860785/rZfECK7b9s0DELHh4dso',
        value: .25 * (purchaseQuantity * price),
        currency: 'USD'
      },
    });

    mixpanel.track("Event Ticket - Check Out", { event_id: event_id, ticket_type_id: ticket_type_id, price: price, purchaseQuantity: purchaseQuantity, total_spend: purchaseQuantity * price });

    const stripeRes = await fetch(`/api/events/checkout`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        email: email.toLowerCase(),
        user_id: confirmedUserData.user_id,
        quantity: quantity,
        event_id: event_id,
        ticket_type_id: ticket_type_id
      }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data.sessionUrl) {
          window.location.assign(data.sessionUrl);
        }
        // Handle Rejection / Errors
        if (data.status) {
          setSubmitting(false)
          if (data.status === "success") {
            toast({
              position: "top",
              description: data.message,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
            //   await lookupExistingBid(userStore.id);
            // router.reload()
          }
          else {
            toast({
              position: "top",
              description: data.message,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        }
      })
      .catch((err) => console.log(err));

    setSubmitting(false);

  }

  const handleCardPayment = async () => {
    paymentCallback && (await paymentCallback());
  };

  const getScreen = () => {
    switch (screen) {
      case "email":
        return (
          <Stack spacing={4}>
            <FormControl isInvalid={Boolean(errorMessage.email)}>
              <FormLabel>Email</FormLabel>
              <Input
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage({
                    email: "",
                  });
                }}
                type="text"
                placeholder="Email"
                variant="outline"
                borderColor={"#4e5ab5"}
                border="1px"
                backdropFilter={"blur(10px)"}
                backgroundColor={"blueBlackTransparent"}
              />
              {errorMessage.email && (
                <FormErrorMessage>{errorMessage.email}</FormErrorMessage>
              )}
            </FormControl>
            <Stack justifyContent="center" alignItems="center">
              <Button
                bg="#0E9DE5"
                rounded="sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                  handleSubmit(e)
                }
                minW="200px"
                transform="matrix(0.89, 0, -0.58, 1, 0, 0)"
                isLoading={submitting}
              >
                <Text
                  textTransform="uppercase"
                  fontStyle="normal"
                  fontWeight="bold"
                  transform="matrix(1, 0, 0.5, 0.8, 0, 0)"
                >
                  Enter Payment
                </Text>
              </Button>
            </Stack>
          </Stack>
        );
      case "payment":
        return (
          <VStack mt={4} spacing={6}>
            <Box
              border="1px solid white"
              p={4}
              borderRadius="10px"
              cursor="pointer"
              transition="all .1s ease-in-out"
              _hover={{
                background: "rgba(255,255,255,0.1)",
              }}
              w="100%"
              onClick={() => {
                // buyfunction
                // onClose();
              }}
            >
              <VStack align={"start"}>
                <Text fontWeight="bold">Crypto Wallet</Text>
                <Text color="gray.300">Phantom, Solflare, etc...</Text>
              </VStack>
            </Box>
            <Box
              border="1px solid white"
              p={4}
              borderRadius="10px"
              cursor="pointer"
              transition="all .1s ease-in-out"
              _hover={{
                background: "rgba(255,255,255,0.1)",
              }}
              w="100%"
              onClick={() => handleCardPayment()}
            >
              <VStack align={"start"}>
                <Text fontWeight="bold">Credit Card</Text>
                <Text color="gray.300">Visa, MC, ApplePay, GooglePay</Text>
              </VStack>
            </Box>
          </VStack>
        );
      case "success":
        return (
          <VStack mt={4} spacing={6}>
            <Stack justifyContent="center" alignItems="center">
              <GiConfirmed size={80} color="green" />
              <Text> Success </Text>
            </Stack>
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setEmail("");
        setScreen("email");
      }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent background="#040d27" width={["360px", "full"]}>
        {screen !== "success" && (
          <>
            <ModalHeader>Payment</ModalHeader>
          </>
        )}
        <ModalCloseButton />
        <ModalBody minH="20vh" pb={6}>
          {getScreen()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EventModal;
