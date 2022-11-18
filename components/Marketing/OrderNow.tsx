import userStore from "@/mobx/UserStore";
import BlueCheck from "@/svgs/BlueCheck";
import ChevronDown from "@/svgs/ChevronDown";
import ChevronUp from "@/svgs/ChevronUp";
import validateEmail from "@/utils/validateEmail";
import {
  Box,
  Button,
  HStack,
  Image,
  Input,
  Spinner,
  Stack,
  Text,
  toast,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import cookieCutter from "cookie-cutter";
import { Carousel } from "react-responsive-carousel";
import VerifiedInkNft from "../VerifiedInkNft/VerifiedInkNft";
import useWindowDimensions from "@/utils/useWindowDimensions";
import UserDetails from "@/types/UserDetails";
import { toJS } from "mobx";

interface Props {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  handleSubscribe: (product: string) => any;
  submitting: boolean;
  width: number | undefined;
}

const OrderNow = () => {
  const { width } = useWindowDimensions();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nftId, setNftId] = useState(0);

  // Why is userStore not available here?
  useEffect(() => {
    console.log(toJS(userStore.nft));
    // This is always empty
  }, [userStore, userStore.loaded]);

  async function handleSubscribe(product: string) {
    if (!validateEmail(email)) {
      toast({
        position: "top",
        status: "error",
        description: "Please enter a valid email address.",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    /// Get or Create Account
    const userDetails = await getOrCreateAccount(email.toLowerCase());

    setSubmitting(false);

    console.log({ email: email, user_id: userDetails.id, product: product });

    // attach nft to user if there's a temp nft
    const temp_user_id = cookieCutter.get("temp_user_id");

    if (temp_user_id) {
      const attached = await attachTempNftToUser(temp_user_id, userDetails);
      if (!attached.success) {
        setSubmitting(false);
        toast({
          position: "top",
          status: "error",
          description:
            "Error saving your NFT. Please contact us using the blue button below.",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    if (product === "hobbyist") {
      userStore.ui.nextStep();
    }
    else{


    // Forward to stripe checkout
    const stripeRes = await fetch(`/api/marketplace/arCheckout`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        email: email.toLowerCase(),
        user_id: userDetails.user_id,
        quantity: product === "elite" ? 1 : 5,
        nft_id: userStore.nft?.id,
        back_url: "create2",
      }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data.sessionUrl) {
          window.location.assign(data.sessionUrl);
        }
        // Handle Rejection / Errors
        if (data.status) {
          setSubmitting(false);
          if (data.status === "success") {
            toast({
              position: "top",
              description: data.message,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
          } else {
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
    }

    setSubmitting(false);
  }

  const getOrCreateAccount = async (email: string) => {
    const sign_up = localStorage.getItem("sign_up");
    setSubmitting(true);
    const res = await fetch(`/api/admin/create-user`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        email,
      }),
    })
      .then((res) => res.json())
      .catch((err) => {
        console.log(err);
        return {
          user: null,
          userDetails: null,
          error: true,
        };
      });

    if (res.userDetails === null) {
      toast({
        position: "top",
        status: "error",
        description: "There was an error creating your account.",
        duration: 3000,
        isClosable: true,
      });
      setSubmitting(false);
      return;
    }

    if (sign_up === "true") {
      localStorage.setItem("sign_up", "completed");
    }

    return res.userDetails;
  };

  const attachTempNftToUser = async (
    temp_user_id: string,
    userDetails: UserDetails
  ) => {
    const res2 = await fetch(`/api/admin/update-temp-nft-data`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        temp_user_id,
        user_id: userDetails.user_id,
        user_details_id: userDetails.id,
      }),
    })
      .then((res) => res.json())
      .catch((err) => {
        console.log(err);
        setSubmitting(false);
        return {
          success: false,
          message:
            "We're having some technical difficulties. Please contact us using the blue button below.",
        };
      });

    if (res2.success) {
      // unset cookie
      // cookieCutter.set("temp_user_id", null, {
      //   expires: new Date(0),
      // });
      return {
        success: true,
      };
    } else
      return {
        success: false,
        message: res2.message,
      };
  };

  return (
    <Box
      // borderTop="2px solid"
      // borderColor={"viBlue"}
      mt={"0px !important"}
      pt={"2rem !important"}
      px={[0, 0, 8]}
    >
      <HStack
        display={["none", "none", "flex"]}
        pb={4}
        px={6}
        spacing={4}
        borderBottom={"1px solid rgba(255,255,255,0.1)"}
        position="relative"
      >
        <Box flex={1} position="absolute" top="15px" left="25px">
          <VerifiedInkNft
            nftWidth={120}
            nftId={userStore.nft?.id || 1}
            preventFlip={false}
          />
        </Box>
        <Box flex={1} />
        <VStack flex={4} align="start">
          <Text fontSize={"2xl"}>How does it work?</Text>
          <Text color="gray3">
            We'll ship your AR cards to your provided address. Once you receive
            them, simply scan the card with your phone camera and you'll see
            your VerifiedInk in Augmented Reality through your phone. Flip the
            card over and your video will start playing.
          </Text>
        </VStack>
        <video width="300" autoPlay loop muted playsInline>
            <source
              src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-safari.mp4"
              type='video/mp4; codecs="hvc1"' />
            <source
              src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-vp9-chrome.webm"
              type="video/webm" />
          </video>
      </HStack>
      <Box
        display="flex"
        flexDirection={["column", "column", "row"]}
        mt={[0, 0, 8]}
      >
        <ElitePrice
          email={email}
          setEmail={setEmail}
          handleSubscribe={handleSubscribe}
          submitting={submitting}
          width={width}
        />
        <LegendPrice
          email={email}
          setEmail={setEmail}
          handleSubscribe={handleSubscribe}
          submitting={submitting}
          width={width}
        />
        <HobbyistPrice
          email={email}
          setEmail={setEmail}
          handleSubscribe={handleSubscribe}
          submitting={submitting}
          width={width}
        />
      </Box>
    </Box>
  );
};

const HobbyistPrice: React.FC<Props> = ({
  email,
  setEmail,
  handleSubscribe,
  submitting,
  width,
}) => {
  const [showEmail, setShowEmail] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (width && width >= 992) {
      setShow(true);
    }
  }, [width]);

  const HobbyistCopy = [
    "Link to your digital collectible",
    "Ability to share online",
  ];
  return (
    <Box
      padding={4}
      transition="all 0.1s ease-in-out"
      overflow="hidden"
      flex={1}
      order={[3, 3, 1]}
      mt={[0, 0, 6]}
      mr={[0, 0, "-2.5rem"]}
    >
      <VStack
        position="relative"
        background="blueBlack2"
        borderRadius={"5px"}
        pb={8}
        spacing={0}
      >
        <HStack
          w="100%"
          bg="rgba(79, 85, 103, 0.2)"
          px={4}
          py={2}
          pb={12}
          clipPath="polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)"
          borderRadius={"5px"}
          align="start"
          minH={"200px"}
        >
          <VStack
            align="start"
            justify={"start"}
            flex={1}
            padding={2}
            spacing={0}
            pt={6}
          >
            <Text
              color="viBlue"
              fontWeight={"semibold"}
              fontSize="2xl"
              lineHeight={"0.5"}
            >
              HOBBYIST
            </Text>
            <Text color="white" fontSize="4xl">
              Free
            </Text>
          </VStack>
          <Box flex={1} position="relative">
            <Box
              position="absolute"
              top="0px"
              left="45px"
              display="flex"
              justifyContent={"center"}
              alignItems="center"
            >
              <VerifiedInkNft
                nftWidth={80}
                nftId={userStore.nft?.id || 1}
                preventFlip={false}
              />
            </Box>
          </Box>
        </HStack>

        <Box px={4} w="100%" onClick={() => setShow(!show)}>
          <HStack
            pt={8}
            pb={2}
            w="100%"
            justify={"space-between"}
            align="center"
            borderBottom="1px solid rgba(255,255,255,0.1)"
          >
            <Text color="viBlue">Utility</Text>
            <Box
              sx={{
                ["> svg"]: {
                  width: "25px",
                  height: "25px",
                  stroke: "viBlue",
                },
              }}
            >
              {show ? <ChevronUp /> : <ChevronDown />}
            </Box>
          </HStack>
        </Box>

        {show && (
          <>
            <VStack
              background="darkPurple"
              w="100%"
              px={4}
              py={4}
              pt={2}
              mb={4}
            >
              {HobbyistCopy.map((copy, index) => (
                <HStack
                  justify={"space-between"}
                  w="100%"
                  borderBottom="1px solid rgba(255,255,255,0.1)"
                  py={4}
                  px={0}
                  key={index}
                  sx={{
                    ["> svg"]: {
                      width: "25px",
                      height: "25px",
                    },
                  }}
                >
                  <Text fontSize={"md"} textAlign="start">
                    {copy}
                  </Text>
                  <BlueCheck />
                </HStack>
              ))}
            </VStack>
          </>
        )}
        <VStack
          marginTop={show ? "1rem !important" : "2rem !important"}
          w="100%"
        >
          {showEmail && (
            <HStack pb={6}>
              <Input
                type="email"
                placeholder="Your email"
                colorScheme={"whiteAlpha"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={() => handleSubscribe("hobbyist")}
                disabled={submitting}
              >
                {submitting ? <Spinner /> : "Submit"}
              </Button>
            </HStack>
          )}
          <Button
            w="85%"
            p={7}
            bg="viBlue"
            fontSize={"2xl"}
            onClick={() => setShowEmail(true)}
          >
            Sign Up
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

const ElitePrice: React.FC<Props> = ({
  email,
  setEmail,
  handleSubscribe,
  submitting,
}) => {
  const [showEmail, setShowEmail] = useState(false);
  const [show, setShow] = useState(true);

  const EliteCopy = [
    "Link to your digital collectible",
    "Ability to share online",
    "A series of 10 NFTs you can sell",
    "One physical AR card sent to you",
    "Ability to update your NFT with new content",
  ];

  return (
    <Box
      padding={4}
      transition="all 0.1s ease-in-out"
      overflow={"hidden"}
      flex={1}
      zIndex={423}
      order={[1, 1, 2]}
    >
      <VStack
        position="relative"
        background="blueBlack2"
        borderRadius={"5px"}
        boxShadow="0px 10px 30px rgba(4, 13, 39, 0.5)"
        pb={8}
        spacing={0}
        zIndex={123}
      >
        <Box
          position="absolute"
          top="165px"
          left="-10px"
          zIndex={5}
          background="viBlue"
          display="flex"
          alignItems={"center"}
          justifyContent="center"
          boxShadow={"0px 3px 9px 0px #00000014"}
          px={4}
          py={2}
          _before={{
            content: '""',
            position: "absolute",
            bottom: "-6px",
            left: "1px",
            transform: "translateX(0) rotate(45deg)",
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderBottom: "7px solid #016597",
          }}
        >
          <Text
            fontWeight={"bold"}
            color="white"
            fontSize="md"
            textTransform={"capitalize"}
          >
            MOST POPULAR
          </Text>
        </Box>
        <HStack
          w="100%"
          bg="rgba(79, 85, 103, 0.2)"
          px={4}
          py={2}
          pb={12}
          clipPath="polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)"
          borderRadius={"5px"}
          align="start"
          minH={"215px"}
        >
          <VStack
            align="start"
            justify={"start"}
            flex={1}
            padding={2}
            spacing={0}
            pt={6}
          >
            <Text
              color="viBlue"
              fontWeight={"semibold"}
              fontSize="2xl"
              lineHeight={"0.5"}
            >
              ELITE
            </Text>
            <Text color="white" fontSize="4xl">
              $19.99
            </Text>
            <Text color="gray5" fontSize={"lg"} textDecor={"line-through"}>
              $29.99
            </Text>
          </VStack>
          <Box flex={1} position="relative">
            <Box
              zIndex={10}
              position="absolute"
              left="-25px"
              top="0"
              sx={{
                ["> svg"]: {
                  width: "65px",
                  height: "65px",
                },
              }}
            >
              <X1 />
            </Box>
            <Image
              src="/target-front-1.png"
              w="auto !important"
              h="120px"
              position="absolute"
              top="25px"
              left="10px"
            />
            <Box
              position="absolute"
              top="0px"
              left="55px"
              display="flex"
              justifyContent={"center"}
              alignItems="center"
            >
              <VerifiedInkNft
                nftWidth={80}
                nftId={userStore.nft?.id || 1}
                preventFlip={false}
              />
            </Box>
          </Box>
        </HStack>

        <Box px={4} w="100%" onClick={() => setShow(!show)}>
          <HStack
            pt={8}
            pb={2}
            w="100%"
            justify={"space-between"}
            align="center"
            borderBottom="1px solid rgba(255,255,255,0.1)"
          >
            <Text color="viBlue">Utility</Text>
            <Box
              sx={{
                ["> svg"]: {
                  width: "25px",
                  height: "25px",
                  stroke: "viBlue",
                },
              }}
            >
              {show ? <ChevronUp /> : <ChevronDown />}
            </Box>
          </HStack>
        </Box>

        {show && (
          <>
            <VStack background="darkPurple" w="100%" px={4} py={4} pt={2}>
              {EliteCopy.map((copy, index) => (
                <HStack
                  justify={"space-between"}
                  w="100%"
                  borderBottom="1px solid rgba(255,255,255,0.1)"
                  py={4}
                  px={0}
                  key={index}
                  sx={{
                    ["> svg"]: {
                      width: "25px",
                      height: "25px",
                    },
                  }}
                >
                  <Text fontSize={"md"} textAlign="start">
                    {copy}
                  </Text>
                  <BlueCheck />
                </HStack>
              ))}
            </VStack>
          </>
        )}
        <VStack
          marginTop={show ? "1rem !important" : "2rem !important"}
          w="100%"
        >
          {showEmail && (
            <HStack pb={6}>
              <Input
                type="email"
                placeholder="Your email"
                colorScheme={"whiteAlpha"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={() => handleSubscribe("elite")}
                disabled={submitting}
              >
                {submitting ? <Spinner /> : "Submit"}
              </Button>
            </HStack>
          )}
          <Button
            w="85%"
            p={7}
            bg="viBlue"
            fontSize={"2xl"}
            onClick={() => {
              setShowEmail(true);
            }}
          >
            Buy Now
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

const LegendPrice: React.FC<Props> = ({
  email,
  setEmail,
  handleSubscribe,
  submitting,
  width,
}) => {
  const [showEmail, setShowEmail] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (width && width >= 992) {
      setShow(true);
    }
  }, [width]);

  const LegendsCopy = [
    "Everything in the Elite package",
    "Five physical AR cards sent to you",
    "Five free card unlocks in 2023",
    "First access to new features",
  ];

  return (
    <Box
      padding={4}
      transition="all 0.1s ease-in-out"
      overflow="hidden"
      flex={1}
      order={[2, 2, 3]}
      mt={[0, 0, 6]}
      ml={[0, 0, "-2.5rem"]}
    >
      <VStack
        position="relative"
        background="blueBlack2"
        borderRadius={"5px"}
        pb={8}
        spacing={0}
      >
        <HStack
          w="100%"
          bg="rgba(79, 85, 103, 0.2)"
          px={4}
          py={2}
          pb={12}
          clipPath="polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)"
          borderRadius={"5px"}
          align="start"
          minH={"215px"}
        >
          <VStack
            align="start"
            justify={"start"}
            flex={1}
            padding={2}
            spacing={0}
            pt={6}
          >
            <Text
              color="viBlue"
              fontWeight={"semibold"}
              fontSize="2xl"
              lineHeight={"0.5"}
            >
              LEGENDS
            </Text>
            <Text color="white" fontSize="4xl">
              $59.99
            </Text>
            <Text color="gray5" fontSize={"lg"} textDecor={"line-through"}>
              $79.99
            </Text>
          </VStack>
          <Box flex={1} position="relative">
            <Box
              zIndex={10}
              position="absolute"
              left="-20px"
              top="0"
              sx={{
                ["> svg"]: {
                  width: "65px",
                  height: "65px",
                },
              }}
            >
              <X5 />
            </Box>
            <Image
              src="/target-front-1.png"
              w="auto !important"
              h="120px"
              position="absolute"
              top="25px"
              left="0px"
            />
            <Box
              position="absolute"
              top="0px"
              left="45px"
              display="flex"
              justifyContent={"center"}
              alignItems="center"
            >
              <VerifiedInkNft
                nftWidth={80}
                nftId={userStore.nft?.id || 1}
                preventFlip={false}
              />
            </Box>
          </Box>
        </HStack>

        <Box px={4} w="100%" onClick={() => setShow(!show)}>
          <HStack
            pt={8}
            pb={2}
            w="100%"
            justify={"space-between"}
            align="center"
            borderBottom="1px solid rgba(255,255,255,0.1)"
          >
            <Text color="viBlue">Utility</Text>
            <Box
              sx={{
                ["> svg"]: {
                  width: "25px",
                  height: "25px",
                  stroke: "viBlue",
                },
              }}
            >
              {show ? <ChevronUp /> : <ChevronDown />}
            </Box>
          </HStack>
        </Box>

        {show && (
          <>
            <VStack background="darkPurple" w="100%" px={4} py={4} pt={2}>
              {LegendsCopy.map((copy, index) => (
                <HStack
                  justify={"space-between"}
                  w="100%"
                  borderBottom="1px solid rgba(255,255,255,0.1)"
                  py={4}
                  px={0}
                  key={index}
                  sx={{
                    ["> svg"]: {
                      width: "25px",
                      height: "25px",
                    },
                  }}
                >
                  <Text fontSize={"md"} textAlign="start">
                    {copy}
                  </Text>
                  <BlueCheck />
                </HStack>
              ))}
            </VStack>
          </>
        )}
        <VStack
          marginTop={show ? "1rem !important" : "2rem !important"}
          w="100%"
        >
          {showEmail && (
            <HStack pb={6}>
              <Input
                type="email"
                placeholder="Your email"
                colorScheme={"whiteAlpha"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={() => handleSubscribe("legends")}
                disabled={submitting}
              >
                {submitting ? <Spinner /> : "Submit"}
              </Button>
            </HStack>
          )}
          <Button
            w="85%"
            p={7}
            bg="viBlue"
            fontSize={"2xl"}
            onClick={() => {
              setShowEmail(true);
            }}
          >
            Buy Now
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

const X1 = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_d_187_6361)">
      <rect
        x="9"
        y="6"
        width="30"
        height="30"
        rx="15"
        fill="#47516D"
        shapeRendering="crispEdges"
      />
      <path
        d="M22.5353 21.964L24.3833 19.396H22.5353L21.6713 20.692L20.7833 19.396H18.9233L20.7713 21.964L18.5513 25H20.3993L21.6593 23.212L22.8953 25H24.7313L22.5353 21.964ZM25.0737 18.388V19.864L26.8857 19.168V25H28.4697V17.032H28.3377L25.0737 18.388Z"
        fill="white"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_187_6361"
        x="0"
        y="0"
        width="48"
        height="48"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="3" />
        <feGaussianBlur stdDeviation="4.5" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_187_6361"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_187_6361"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);

const X5 = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_d_187_5655)">
      <rect
        x="9"
        y="6"
        width="30"
        height="30"
        rx="15"
        fill="#47516D"
        shapeRendering="crispEdges"
      />
      <path
        d="M21.239 22.211L23.241 19.429H21.239L20.303 20.833L19.341 19.429H17.326L19.328 22.211L16.923 25.5H18.925L20.29 23.563L21.629 25.5H23.618L21.239 22.211ZM27.7459 19.728C27.1479 19.728 26.5889 19.91 26.1859 20.196L26.5239 18.558H29.9559V16.972H25.1069L24.3659 21.262L25.3669 21.899C25.8869 21.444 26.5759 21.132 27.2389 21.132C28.1489 21.132 28.8119 21.73 28.8119 22.562C28.8119 23.433 28.1229 24.057 27.1479 24.057C26.4979 24.057 25.7439 23.628 25.4579 23.03L24.1319 23.914C24.6909 24.941 25.9779 25.656 27.2259 25.656C28.9939 25.656 30.5409 24.473 30.5409 22.575C30.5409 20.937 29.3839 19.728 27.7459 19.728Z"
        fill="white"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_187_5655"
        x="0"
        y="0"
        width="48"
        height="48"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="3" />
        <feGaussianBlur stdDeviation="4.5" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_187_5655"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_187_5655"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);

export default observer(OrderNow);
