import { Box, Button, Flex, Heading, HStack, Input, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Stack, StackProps, Text, useDisclosure, useToast } from "@chakra-ui/react";
import * as React from "react";
import { useEffect, useState } from "react";
import Card from "../NftCard/Card";
import ViLogo from "./logos/ViLogo";
import cookieCutter from 'cookie-cutter';
import router from "next/router";
import { addEmailToWaitlist } from "@/supabase/supabase-client";
import validator from "validator"

export const SplashModal = (props: StackProps): JSX.Element | null => {
  const [visible, setVisible] = useState<boolean>(true);
  const toast = useToast();

  const handleAcceptance = () => {
    cookieCutter.set('show-banner','true')
    toast({
      position: "top",
      description: "You're in!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setVisible(false);
  };

  useEffect(() => {
    if(cookieCutter.get('show-banner')){
      router.push("/create")
    }
  }, [visible])

  const [showCodeEntry, setCodeEntry] = useState(false)
  const [showEmailEntry, setEmailEntry] = useState(false)

  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')

  function enterCode() {
    setCodeEntry(true)

  }

  function verifyCode() {
    code.toLowerCase() === "getverified" ? handleAcceptance() : 
    toast({
      position: "top",
      description: "That was not the right code. Do you want to sign up for the waitlist?",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    setCodeEntry(false)
  }

  function enterEmail() {
    setEmailEntry(true)
  }

  async function handleEmail() {
    
    if(!validator.isEmail(email)){
      toast({
        position: "top",
        status: "error",
        description: "Please enter a valid email.",
        duration: 3000,
        isClosable: true,
      });
      return null;
    }

    const { data: data, error: error } = await addEmailToWaitlist(email)
    if (error) {
      toast({
        position: "top",
        status: "error",
        description: error.message,
        duration: 3000,
        isClosable: true,
      });
    } else {
      setEmailEntry(false)
      toast({
        position: "top",
        description: `Thank you for signing up.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
    
  }

  if (!visible) {
    return null;
  }

  return (

          <Box as="section" py={{ lg: '12' }}>
            <Box
              bg="gray.900"
              rounded={{ lg: '2xl' }}
              maxW="5xl"
              mx="auto"
              px={{ base: '4', sm: '6', lg: '8' }}
              py={{ base: '12', sm: '16' }}
            >
              <Flex align="top" justify="center" direction={{ base: 'column', md: 'row' }}>
                <Box flex="1" maxW="xl" mx="auto" color="white" textAlign="center">
                  <Flex justify="center" mb="6">
                    <ViLogo width="150px" height="150px" />
                  </Flex>
                  <Flex mt={2} align="center" justify="center">
                    <Text
                      textTransform="uppercase"
                      fontWeight="semibold"
                      fontSize="4xl"
                      mr={1}
                    >
                      Verified
                    </Text>
                    <Text
                      fontWeight="light"
                      alignSelf="flex-start"
                      textTransform="uppercase"
                      fontSize="4xl"
                    >
                      Ink
                    </Text>
                  </Flex>
                  <Text mb="4" mt="4" fontSize="xl" color="whiteAlpha.800"  >
                    Home of your first digital collectable. <br />Completely free to make.<br />
                    Earn on each and every sale.
                  </Text>
                  <Stack
                    direction={{ base: 'column', sm: 'row' }}
                    mt="10"
                    justify="center"
                    spacing={{ base: '3', md: '5' }}
                    maxW="md"
                    mx="auto"
                  >
                    {!showCodeEntry && !showEmailEntry &&
                      <>
                        <Button
                          onClick={enterCode}
                          size="lg"
                          h="16"
                          px="10"
                          colorScheme="blue"
                          textColor="whiteAlpha.900"
                          fontWeight="bold"
                          flex={{ md: '1' }}
                        >
                          Enter Code
                        </Button>
                        <Button
                          onClick={enterEmail}
                          flex={{ md: '1' }}
                          variant="outline"
                          size="lg"
                          h="16"
                          px="10"
                          fontWeight="bold"
                        >
                          Sign up for Waitlist
                        </Button>
                      </>

                    }

                    {showCodeEntry && <>
                      <Input
                        id="code"
                        name="code"
                        size="md"
                        fontSize="md"
                        value={code}
                        onInput={e => setCode((e.target as HTMLInputElement).value)}
                        variant="flushed"
                        color="white.900"
                        placeholder="Enter Access Code"
                        focusBorderColor="blue.200"
                      />
                      <Button
                        onClick={verifyCode}

                        size="md"
                        px="10"
                        fontWeight="bold"
                        colorScheme="blue"
                        textColor="white.900"
                      >
                        Get Verified!
                      </Button>

                    </>}

                    {showEmailEntry && <>
                      <Input
                        id="email"
                        name="email"
                        size="md"
                        value={email}
                        onInput={e => setEmail((e.target as HTMLInputElement).value)}
                        fontSize="md"
                        variant="flushed"
                        color="white.900"
                        placeholder="Your Email Address"
                        focusBorderColor="blue.200"
                      />
                      <Button
                        onClick={handleEmail}
                        size="md"
                        px="10"
                        fontWeight="bold"
                        colorScheme="blue"
                        textColor="white.900"
                      >
                        Join the Waitlist
                      </Button>

                    </>}

                  </Stack>

                </Box>
                <Box flex="1" mt="4" maxH={{ md: 650, base: 550 }}>
                  <Card nft_id={93} readOnly={true} />
                </Box>

              </Flex>
            </Box>

          </Box>

  




  );
};
