import useWindowDimensions from "@/utils/useWindowDimensions";
import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Divider,
  Flex,
  HStack,
  IconButton,
  Spacer,
  Stack,
  TabIndicator,
  TabList,
  Tabs,
  useColorModeValue as mode,
  useDisclosure,
} from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, {
  isValidElement,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { MobileNavContent } from "./MobileNavContent";

export const Template: React.FC = (props) => {
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState(0);

  const [goingUp, setGoingUp] = useState(true);
  const [mobile, setMobile] = useState(true);
  const { width } = useWindowDimensions();
  const prevScrollY = useRef(0);

  const children = React.Children.toArray(props.children).filter<ReactElement>(
    isValidElement
  );
  const mobileNav = useDisclosure();
  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";

  useEffect(() => {
    if (router.pathname.toLowerCase().includes("athletes")) {
      setTabIndex(0);
    } else if (router.pathname.toLowerCase().includes("marketplace")) {
      setTabIndex(1);
    } else if (router.pathname.toLowerCase().includes("naas")) {
      setTabIndex(2);
    } else if (router.pathname.toLowerCase().includes("drops")) {
      setTabIndex(2);
    } else if (router.pathname.toLowerCase().includes("blog")) {
      setTabIndex(3);
    } else if (router.pathname.toLowerCase().includes("collection")) {
      setTabIndex(4);
    } else if (router.pathname.toLowerCase().includes("listings")) {
      setTabIndex(5);
    } else {
      setTabIndex(6);
    }
  });

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if(currentScrollY <= 0) {
      setGoingUp(true);
    } else
    if (prevScrollY.current < currentScrollY && goingUp) {
      setGoingUp(false);
    }
    else if (prevScrollY.current > currentScrollY && !goingUp) {
      setGoingUp(true);
    }
    
    prevScrollY.current = currentScrollY;
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [goingUp]);

  useEffect(() => {
    if (width && width < 768) {
      setMobile(true);
    } else {
      setMobile(false);
    }
  }, [width]);

  const variants = {
    hide: {
      originY: "top",
      y: "-106px",
    },
    unHide: {
      originY: "top",
      y: "0px",
    },
  };

  return (
    <motion.div
      id="nav"
      variants={variants}
      initial={{ y: "0px" }}
      animate={mobile && !goingUp ? "hide" : "unHide"}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <Flex
        top={0}
        width="100%"
        position="fixed"
        zIndex={9999}
        py={2}
        px={{ base: 2, md: 4, lg: 6 }}
        bg={{ base: "blueBlackTransparent", lg: "blueBlack" }}
        boxShadow={["none","xl"]}
        backdropFilter="blur(10px)"
        // borderBottomWidth={mode("0", "1px")}
        align="center"
      >
        {children.find((child) => child.type === Brand)?.props.children}
        <HStack display={{ base: "none", lg: "flex" }} marginStart={10}>
          <Tabs
            index={tabIndex}
            onChange={(index) => setTabIndex(index)}
            colorScheme="blue"
            variant="unstyled"
            align="center"
            isFitted
            defaultIndex={4}
          >
            <TabList>
              {children.find((child) => child.type === Links)?.props.children}
            </TabList>
            {/* <TabIndicator
              key={tabIndex}
              position="absolute"
              mt="6px"
              height={1}
              borderTopRadius="md"
              bg={mode("blue.500", "blue.200")}
            /> */}
          </Tabs>
        </HStack>
        <Spacer />
        {children.find((child) => child.type === ColorMode)?.props.children}
        <HStack display={{ base: "none", lg: "flex" }} spacing={3}>
          {children.find((child) => child.type === UserProfile)?.props.children}
        </HStack>
        <HStack display={{ base: "none", lg: "flex" }} spacing={3}>
          {children.find((child) => child.type === SignIn)?.props.children}
        </HStack>

        <Box display={["block", "block", "block", "none"]} mr={4}>
          {MARKET_ENABLED && router.pathname.includes("marketplace") && (
            <WalletMultiButton className="solana-wallet-multi-btn" />
          )}
        </Box>

        <IconButton
          display={{ base: "flex", lg: "none" }}
          size="sm"
          aria-label="Open menu"
          fontSize="20px"
          variant="ghost"
          onClick={mobileNav.onOpen}
          icon={<HamburgerIcon />}
        />
        <MobileNavContent isOpen={mobileNav.isOpen} onClose={mobileNav.onClose}>
          <Stack spacing={5}>
            <Flex>
              {children.find((child) => child.type === Brand)?.props.children}
            </Flex>
            <Tabs
              index={tabIndex}
              onChange={(index) => setTabIndex(index)}
              onClick={mobileNav.onClose}
              orientation="vertical"
              variant="unstyled"
              pl="2px"
            >
              <TabList>
                {children.find((child) => child.type === Links)?.props.children}
              </TabList>
              {/* <TabIndicator
                marginStart="-3"
                width={1}
                borderTopRadius={{ base: "none", lg: "md" }}
                bg={mode("blue.500", "blue.200")}
              /> */}
            </Tabs>
            <Divider />

            <Flex pl="20px" onClick={mobileNav.onClose}>
              {
                children.find((child) => child.type === UserProfile)?.props
                  .children
              }
              {children.find((child) => child.type === SignIn)?.props.children}
            </Flex>
            {
              children.find((child) => child.type === ColorModeMobile)?.props
                .children
            }
          </Stack>
        </MobileNavContent>
      </Flex>
    </motion.div>
  );
};

const Brand: React.FC = () => null;
const Links: React.FC = () => null;
const UserProfile: React.FC = () => null;
const SignIn: React.FC = () => null;
const ColorMode: React.FC = () => null;
const ColorModeMobile: React.FC = () => null;

export const Navbar = Object.assign(Template, {
  Brand,
  Links,
  UserProfile,
  SignIn,
  ColorMode,
  ColorModeMobile,
});
