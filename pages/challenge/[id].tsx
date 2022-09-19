import StaticCard from "@/components/NftCard/StaticCard";
import {
    Box,
    Button,
    Heading,
    HStack,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Spacer,
    Stack,
    Text,
    useDisclosure,
    useToast,
    VStack,
} from "@chakra-ui/react";
import { GetServerSidePropsContext } from "next";
import { motion, useAnimation } from "framer-motion";
import styled from "styled-components";
import { useCallback, useEffect, useRef, useState } from "react";
import delay from "@/utils/delayMethod";
import validateEmail from "@/utils/validateEmail";
import { getUserDetailsByEmail } from "@/supabase/userDetails";
import { createNewUser, getScreenshot, supabase } from "@/supabase/supabase-client";
import * as ga from "@/utils/ga";
import mixpanel from "mixpanel-browser";
import { debounce } from "lodash";
import useWindowDimensions from "@/utils/useWindowDimensions";
import Head from "next/head";
import { MotionBox } from "@/components/ui/ChakraMotion/ChakraMotion";
import { useRouter } from "next/router";
import moment from "moment";

interface Props {
    id: number;
    challenge_data: any;
    leaderboard: any;
    public_url: string;
}

// See https://www.figma.com/file/oqujOXuBtyQpJPFMUWUiYA/VerifiedInk-Top5-Delivery-Mockup-(Copy)?node-id=1%3A154
const Challenge: React.FC<Props> = ({ id, challenge_data, leaderboard, public_url }) => {
    const { width, height } = useWindowDimensions();
    const staticCardControls = useAnimation();
    const leaderboardControls = useAnimation();
    const verifiedFanBtnsControls = useAnimation();
    const [cardSize, setCardSize] = useState(300);
    const [flipCard, setFlipCard] = useState(false);
    const [initFlip, setInitiFlip] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const heroWrapperRef = useRef<HTMLDivElement | null>(null);
    const [selectedTeamId, setSelectedTeamId] = useState<number>();
    const [selectedColor, setSelectedColor] = useState("#33CCFF");
    const [selectedTeam, setSelectedTeam] = useState<any>("");
    const [heroIsLeft, setHeroIsLeft] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState([
        { name: "unc", team_id: -1, total: 400, color: "#7db0d0" },
    ]);
    const [initialLeaderboardData, setInitialLeaderboardData] = useState([])
    const [refresh, setRefresh] = useState(0);
    const [maxVal, setMaxVal] = useState(0);
    const [initialAnimationDone, setInitialAnimationDone] = useState(false);
    const [price, setPrice] = useState(25);
    const [nftId, setNftId] = useState<number>();
    const [nfts, setNfts] = useState<number[]>();
    const [teamChosen, setTeamChosen] = useState<number>();
    const [challengeData, setChallengeData] = useState<any>(challenge_data);
    const [email, setEmail] = useState("");
    const [emailInvalid, setEmailInvalid] = useState(true);
    const [showEmail, setShowEmail] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saleOpen, setSaleOpen] = useState(false);
    const toast = useToast();
    const router = useRouter();

    const { isOpen, onOpen, onClose } = useDisclosure()

    // Leaderboard Component
    // Tapping on the leaderboard should select the school / row and apply the pending total to the total for that school

    //Animations
    useEffect(() => {
        mixpanel.track("Fan Challenge - Page Visit", {
            fc_id: id,
          });
        // Flip card here
        delay(3000).then(() => {
            setInitiFlip(true);
            setFlipCard(true);

            delay(1000).then(() => {
                setFlipCard(false);
            });
        });
    }, []);

    useEffect(() => {
        if (width && width < 480) {
            // run animation
            sequence();

            // set card size
            if (cardSize !== 250) {
                setCardSize(250);
            }
        } else if (width && width >= 480 && width < 768) {
            // run animation
            sequence();

            // set card size
            if (cardSize !== 300) {
                setCardSize(300);
            }
        } else if (width && width >= 768 && width < 992) {
            setInitialAnimationDone(true);
            // set tablet values
            leaderboardControls.start({
                opacity: 1,
                scale: 1,
                transition: {
                    duration: 0,
                },
            });
            staticCardControls.start({
                scale: 1,
                marginTop: "0rem",
                paddingBottom: "0rem",
                transition: {
                    duration: 0,
                },
            });
            verifiedFanBtnsControls.start({
                margin: "0rem",
                transition: {
                    duration: 0,
                },
            });

            // set card size
            if (cardSize !== 325) {
                setCardSize(325);
            }
        } else if (width && width >= 992) {
            // desktop plus
            leaderboardControls.start({
                opacity: 1,
                scale: 1,
                transition: {
                    duration: 0,
                },
            });
            staticCardControls.start({
                scale: 1,
                marginTop: "0rem",
                paddingBottom: "0rem",
                transition: {
                    duration: 0,
                },
            });
            verifiedFanBtnsControls.start({
                margin: "0rem",
                transition: {
                    duration: 0,
                },
            });
            if (cardSize !== 380) {
                setCardSize(380);
            }
        }
    }, [width]);

    async function sequence() {

        await verifiedFanBtnsControls.start({
            marginTop: "0px",
            transition: { duration: 0.5, ease: "easeInOut" },
        });

        await staticCardControls.start({
            scale: 1,
            transition: { delay: 4, duration: .75, ease: "easeInOut" },
        });
        // await staticCardControls.start({
        //     transition: { duration: 1, ease: "easeInOut" },
        // });

        setInitialAnimationDone(true);

        if (heroWrapperRef.current) {
            heroWrapperRef.current.scrollLeft = heroWrapperRef.current?.clientWidth;
        }
        
    }

    const debounceFn = useCallback(debounce(handleDebounceCheckScroll, 200), []);

    function handleDebounceCheckScroll(
        width: number,
        quarterWidth: number,
        scroll: number
    ) {
        if (!heroWrapperRef.current) return;
        // Check if user stopped scrolling, and make it fixed to the scroll end if not there
        if (scroll > quarterWidth) {
            // Check if scroll is stopped to end
            if (scroll !== width) {
                heroWrapperRef.current.scrollLeft = width;
            }
        } else {
            if (scroll !== 0) {
                heroWrapperRef.current.scrollLeft = 0;
            }
        }
    }

    function handleHeroScroll(e: React.UIEvent<HTMLElement>) {
        if (heroWrapperRef.current) {
            const width = heroWrapperRef.current.clientWidth;
            const quarterWidth = width / 4;
            const scroll = heroWrapperRef.current.scrollLeft;

            /**
             * If less than half width, then it's scrolling from left
             * if its greater than half width its scrolling from right
             */
            if (scroll > quarterWidth) {
                // is right side
                setHeroIsLeft(false);
            } else if (scroll < quarterWidth) {
                setHeroIsLeft(true);
            }
            debounceFn(width, quarterWidth, scroll);
        }
    }

    useEffect(() => {
        // scroll animation
        if (!initialAnimationDone) return;
        if (width && width < 768) {
            // run if on mobile
            // if hero is right side
            // then animate the challenge btns up
            if (heroIsLeft) {
                staticCardControls.start({
                    scale: 1,
                    marginRight: "0rem",
                    transition: { duration: 0.5, ease: "easeInOut" },
                });
                leaderboardControls.start({
                    opacity: 0.5,
                    scale: 0.8,
                    marginLeft: "-4rem",
                    transition: {
                        duration: 0.5,
                        ease: "easeInOut",
                    },
                });
                // verifiedFanBtnsControls.start({
                //     marginTop: "-4rem",
                //     transition: {
                //         duration: 0.5,
                //         ease: "easeInOut",
                //     },
                // });
            } else {
                staticCardControls.start({
                    scale: 0.9,
                    marginRight: "-4.25rem",
                    transition: { duration: 0, ease: "easeInOut" },
                });
                leaderboardControls.start({
                    marginLeft: "0rem",
                    transition: {
                        duration: 0,
                    },
                });
                leaderboardControls.start({
                    opacity: 1,
                    scale: 1,
                    transition: {
                        duration: 0.5,
                        ease: "easeInOut",
                    },
                });
                // verifiedFanBtnsControls.start({
                //     marginTop: "-4.5rem",
                //     transition: {
                //         duration: 0,
                //         ease: "easeInOut",
                //     },
                // });
            }
        } else {
            // set elements to desktop values
            leaderboardControls.start({
                opacity: 1,
                scale: 1,
                marginLeft: "0rem",
                transition: {
                    duration: 0,
                    ease: "easeInOut",
                },
            });
            staticCardControls.start({
                scale: 1,
                marginRight: "0rem",
                transition: { duration: 0, ease: "easeInOut" },
            });
        }
    }, [heroIsLeft, width, height, initialAnimationDone]);

    useEffect(() => {
        const getChallengeData = async (id: number) => {
            const res = await fetch(`/api/challenge/getChallengeData?fc_id=${id}`);
            const data = await res.json();
            setLeaderboardData(data.leaderboard);
            setInitialLeaderboardData(data.leaderboard);
            setPrice(data.price);
            setNftId(data.nfts[0].nft_id);
            setNfts(data.nfts.map((nft: any) => nft.nft_id));
            data.team_chosen ? setTeamChosen(data.team_chosen) : null
            const maxVal = data.leaderboard.reduce((acc: number, curr: any) => {
                return curr.total > acc ? curr.total : acc;
            }, 0);

            setChallengeData(data);
            setSaleOpen(new Date(data.start_time).valueOf() < Date.now());
            setMaxVal(maxVal);
            if(router.query.team_id || data.team_chosen){
                let team_id = parseInt(router.query.team_id as string)
                if(data.team_chosen){
                    team_id = data.team_chosen
                }
                setSelectedTeamId(team_id)
                const team = data.leaderboard.filter(
                    (team: any) => team.team_id === team_id
                )[0]
                setSelectedTeam(team.name)
                setSelectedColor(team.color)
            }
        };

        id ? getChallengeData(id) : null;
    }, [id]);

    useEffect(() => {
        // set initial leaderboard school
        setSelectedTeamId(leaderboardData[0].team_id);
        setSelectedColor("#525AB2");
    }, []);

    // useEffect(()=>{
    //     if(router){
    //         console.log(router.query)
    //         if(router.query.team_id){
    //             handleClickSchool(parseInt(router.query.team_id as string))
    //         }
    //     }
    // },[router])

    useEffect(() => {
        // console.table(leaderboardData)
        const new_leaderboard = initialLeaderboardData.map(
            (team: any) => {
                if (team.team_id === selectedTeamId) {
                    const new_total = team.total + quantity * price
                    return {
                        ...team,
                        total: team.total + quantity * price,
                    };
                }
                else return { ...team }
            }
        )
        const maxVal = new_leaderboard.reduce((acc: number, curr: any) => {
            return curr.total > acc ? curr.total : acc;
        }, 0);
        setMaxVal(maxVal);
        setLeaderboardData(new_leaderboard)
        setRefresh(refresh + 1)

    }, [quantity, selectedColor]);

    useEffect(() => {
        if (email.trim().length != email.length) {
            setEmail(email.trim());
            return;
        }
        const valid = validateEmail(email);
        if (!valid) {
            setEmailInvalid(true);
        } else {
            setEmailInvalid(false);
        }
    }, [email]);

    useEffect(() => {
        if (email.trim().length != email.length) {
            setEmail(email.trim());
            return;
        }
        const valid = validateEmail(email);
        if (!valid) {
            setEmailInvalid(true);
        } else {
            setEmailInvalid(false);
        }
    }, [email]);

    async function handlePurchase(e: any) {
        setLoading(true);

        const { data: userData, error: userError } = await getUserDetailsByEmail(
            email.toLowerCase()
        );

        !userData ? await createNewUser(email) : null;

        const { data: confirmedUserData, error: confirmedError } =
            await getUserDetailsByEmail(email.toLowerCase());

        if (!confirmedUserData) {
            toast({
                position: "top",
                description:
                    "Error accessing your account - please contact support@verifiedink.us",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setLoading(false);
        }

        mixpanel.people.set({
            $email: email.toLowerCase(),
        });

        // ga.event({
        //     action: "conversion",
        //     params: {
        //         send_to: 'AW-10929860785/rZfECK7b9s0DELHh4dso',
        //         value: .06 * (quantity * price),
        //         currency: 'USD'
        //     },
        // });
        mixpanel.track("Fan Challenge - Check Out", {
            price: price,
            quantity: quantity,
            total_spend: quantity * price,
            team_id: selectedTeamId,
            fc_id: id,
        });

        const stripeRes = await fetch(`/api/marketplace/fanChallengeCheckout`, {
            method: "POST",
            headers: new Headers({ "Content-Type": "application/json" }),
            credentials: "same-origin",
            body: JSON.stringify({
                email: email.toLowerCase(),
                user_id: confirmedUserData.user_id,
                quantity: quantity,
                team_id: selectedTeamId,
                fc_id: id,
                product_name: challengeData.name + "'s Fan Challenge",
            }),
        })
            .then((res) => res.json())
            .then(async (data) => {
                if (data.sessionUrl) {
                    window.location.assign(data.sessionUrl);
                }
                // Handle Rejection / Errors
                if (data.status) {
                    setLoading(false);
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

        setLoading(false);
    }

    async function handlePurchase2(e: any) {
        // get selected school, and purchase amount
        // add the purchase amount to the selected school
        const selectedSchoolIndex = leaderboardData.findIndex(
            (school) => school.team_id === selectedTeamId
        );

        const newLeaderboard = leaderboardData.map((school, i) => {
            if (i === selectedSchoolIndex) {
                return {
                    ...leaderboardData[selectedSchoolIndex],
                    total: school.total + price * quantity,
                };
            } else {
                return {
                    ...leaderboardData[i],
                };
            }
        });

        setLeaderboardData([...newLeaderboard]);
    }

    function handleClickSchool(team_id: number) {
        setSelectedTeamId(team_id);
        const color = leaderboardData.filter(
            (team: any) => team.team_id === team_id
        )[0].color;
        const team = leaderboardData.filter(
            (team: any) => team.team_id === team_id
        )[0].name;
        setSelectedTeam(team);
        setSelectedColor(color);
    }

    const meta = (
        <Head>
            <title>{challengeData && `${challengeData.name}'s Fan Challenge`}</title>
            <meta
                property="og:title"
                key="title"
                content={`${challenge_data.name}'s Fan Challenge`}
            />
            <meta
                property="og:image"
                key="preview"
                content={public_url}
            />
            <meta
                property="description"
                key="description"
                content={`The Future of Fandom`}
            />
            <meta
                property="twitter:image"
                key="twitter-image"
                content={`https://verifiedink.us/api/meta/showTwitterPreview/${challenge_data.nfts[0].nft_id}`}
            />
            <meta property="og:video" content={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/athlete_video/${challenge_data.nfts[0].nft_id}.mp4`} />
            <meta property="og:video:type" content="video/mp4" />
            <meta property="og:video:width" content="720" />
            <meta property="og:video:height" content="720" />
        </Head>
    );

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} closeOnEsc={true}>
                <ModalOverlay />
                <ModalContent
                    bgColor={"purpleBlue"}
                    m={12}
                    top={"20%"}
                >
                    <ModalHeader fontSize="2xl">Choose a School</ModalHeader>
                    <ModalBody>
                        Please select a school from the Leaderboard
                    </ModalBody>

                    <ModalFooter>
                        <Button bgColor='viBlue' mr={3} onClick={onClose}>
                            Okay
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Box
                position={"fixed"}
                zIndex={-1}
                background={`radial-gradient(
            500px 500px at top left, ${selectedColor}90, ${selectedColor}05 ), url('/img/challengeBgNew.png')`}
                backgroundRepeat="no-repeat"
                backgroundColor={"blueBlack"}
                height="100vh"
                width="100vw"
            ></Box>
            <Box>
                <Spacer h="56px" />
                <Box w="100%">
                    <VStack spacing={4} h="100%" w="100%">
                        {/* 
                    Using Framer Motion Card should show up large, then flip then flip back and shrink slighlty and move to the left.
                */}
                        <Box
                            className="challenge-staticcard-wrapper"
                            onScroll={handleHeroScroll}
                            ref={heroWrapperRef}
                            width="100%"
                            height="auto"
                            minH={["auto", "600px", "700px"]}
                            padding="1rem"
                            overflowX={"auto"}
                            overflowY="hidden"
                            display={"flex"}
                            sx={{
                                scrollbarWidth: "none",
                                scrollBehavior: "smooth",
                                "&::-webkit-scrollbar": {
                                    display: "none",
                                },
                            }}
                        >
                            <MotionBox
                                animate={staticCardControls}
                                initial={{
                                    scale: 1.2,
                                    marginTop: "2rem",
                                    paddingBottom: "4rem",
                                }}
                            >
                                <Box className="challenge-staticcard-box">
                                    <StaticCard
                                        flip={flipCard}
                                        initFlip={initFlip}
                                        nft_id={nftId!}
                                        width={cardSize}
                                        glow={selectedColor}
                                    ></StaticCard>
                                </Box>
                            </MotionBox>
                            <MotionBox
                                animate={leaderboardControls}
                                initial={{ scale: 0.5, marginLeft: "0rem" }}
                            >
                                <Box w={["100%", "70%", "100%"]} mx={"auto"}>
                                    <VStack
                                        className="challenge-leaderboard-wrapper"
                                        align={"start"}
                                        p="1rem"
                                        spacing={3}
                                        mt={["0rem", "3rem"]}
                                    >
                                        <Heading fontSize={["2xl", "4xl"]}>Leaderboard</Heading>
                                        {leaderboardData
                                            .sort((a, b) => {
                                                if (a.total < b.total) return 1;
                                                if (a.total > b.total) return -1;
                                                return 0;
                                            })
                                            .map((team, i) => (
                                                <HStack
                                                    onClick={() => {
                                                        teamChosen ? null :    
                                                        handleClickSchool(team.team_id)
                                                    }}
                                                    // onTouchEndCapture={() => handleClickSchool(team.team_id)}
                                                    h="62px"
                                                    key={i}
                                                    w="100%"
                                                    maxW={"400px"}
                                                    borderRadius={"10px"}
                                                    transition="all .1s ease-in-out"
                                                    bg={`${team.team_id === selectedTeamId
                                                        ? selectedColor + "60"
                                                        : "none"
                                                        }`}
                                                    backdropFilter="blur(10px)"
                                                    border={`2px solid ${selectedColor}60`}
                                                    filter={(teamChosen && teamChosen !=team.team_id )? "grayscale(90%)" :"none"}
                                                    p="0.5rem 1rem"
                                                    cursor="pointer"
                                                    justifyContent={[
                                                        "flex-start",
                                                        "space-between",
                                                        "flex-start",
                                                    ]}
                                                >
                                                    <Text fontSize={"xl"} w={"20px"}>
                                                        {i + 1}
                                                    </Text>
                                                    <Image
                                                        src={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/teams/${team.team_id}.png`}
                                                        alt=""
                                                        w="40px"
                                                    />
                                                    <Box>
                                                        <Box w={["110px", "110px", "200px"]}>
                                                            <Box
                                                                w={`${(Math.max(team.total, 5) / maxVal) * 100
                                                                    }%`}
                                                                h="7px"
                                                                overflow="none"
                                                                background={
                                                                    team.color == selectedColor
                                                                        ? "white"
                                                                        : team.color
                                                                }
                                                                borderRadius="20px"
                                                                boxShadow={`0px 0px 20px white, 0px 0px 30px ${team.color};`}
                                                            ></Box>
                                                        </Box>
                                                    </Box>
                                                    <HStack align="end">
                                                        <Text>$</Text>
                                                        <Text> {team.total}</Text>
                                                    </HStack>
                                                </HStack>
                                            ))}
                                    </VStack>
                                </Box>
                            </MotionBox>
                        </Box>

                        {/* Leaderboard component should then slide in */}
                        <MotionBox
                            animate={verifiedFanBtnsControls}
                            initial={{ marginTop: "500px" }}
                            padding="0 1rem 1rem 1rem"
                            margin="0rem"
                            width="100%"
                            maxW={"800px"}
                        >
                            <Heading size="lg" mb={6} textAlign="center">
                                Verified Fan Challenge
                            </Heading>
                            {selectedTeam &&
                                <Box textAlign="center" pb={6}>
                                    <Text color="gray.400">Selected Team</Text><Text fontSize="2xl">{selectedTeam}</Text>
                                </Box>

                            }
                            <HStack
                                w="100%"
                                maxW={"500px"}
                                margin={"0 auto"}
                                justify={["space-around"]}
                                align="flex-start"
                            >

                                {!showEmail && (
                                    <Button
                                        bg="#000729"
                                        padding="0.5rem 1.25rem"
                                        display="flex"
                                        textTransform={"uppercase"}
                                        justifyContent="center"
                                        maxW={"300px"}
                                        flex="1"
                                        border={`2px solid ${selectedColor}`}
                                        boxShadow={`0px 0px 20px #cb31bf,
                    0px 0px 30px ${selectedColor}`}
                                        transform={`matrix(0.89, 0, -0.58, 1, 0, 0)`}
                                        sx={{
                                            "> p": {
                                                transform: "matrix(1, 0, 0.58, 1, 0, 0)",
                                            },
                                        }}
                                        disabled={showEmail || quantity == 0 || !saleOpen}
                                        onClick={() => {
                                            if (selectedTeamId && selectedTeamId < 0) {
                                                onOpen();
                                            }
                                            else {
                                                setShowEmail(true);
                                            }
                                        }}
                                    >
                                        <Text mr="1rem">Purchase</Text>
                                        <Text>${price * quantity}</Text>
                                    </Button>
                                )}
                                <VStack>
                                    <HStack flex="1" justify={"center"}>
                                        <Button
                                            border={`2px solid ${selectedColor}`}
                                            transform={`matrix(0.89, 0, -0.58, 1, 0, 0)`}
                                            background="transparent"
                                            backdropFilter={`blur(10px)`}
                                            sx={{
                                                ":active, :focus": {
                                                    background: "unset",
                                                    boxShadow: "none",
                                                },
                                                "> p": {
                                                    transform: "matrix(1, 0, 0.58, 1, 0, 0)",
                                                },
                                            }}
                                            onClick={() => {
                                                if (quantity - 1 >= 1) {
                                                    setQuantity(quantity - 1);
                                                }
                                            }}
                                        >
                                            <Text>-</Text>
                                        </Button>
                                        <Text fontSize="2xl" px={2}>
                                            {quantity}
                                        </Text>
                                        <Button
                                            className="purchase-nft-plus purchase-nft-btn"
                                            bg={selectedColor}
                                            transform={"matrix(0.89, 0, -0.58, 1, 0, 0)"}
                                            sx={{
                                                ":active, :focus": {
                                                    background: selectedColor,
                                                    boxShadow: "none",
                                                },
                                                "> p": {
                                                    transform: "matrix(1, 0, 0.58, 1, 0, 0)",
                                                },
                                            }}
                                            onClick={() => {
                                                setQuantity(quantity + 1);
                                            }}
                                        >
                                            <Text>+</Text>
                                        </Button>
                                    </HStack>
                                    <Text fontSize="sm" color="gray3">
                                        Quantity
                                    </Text>
                                </VStack>
                            </HStack>
                            {showEmail && (
                                <VStack pt={4}>
                                    <Input
                                        maxW={"400px"}
                                        mb={4}
                                        autoFocus
                                        isDisabled={loading}
                                        placeholder="Email@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Button
                                        bg="#000729"
                                        padding="0.5rem 1.25rem"
                                        display="flex"
                                        textTransform={"uppercase"}
                                        justifyContent="center"
                                        maxW={"300px"}
                                        flex="1"
                                        border={`2px solid ${selectedColor}`}
                                        boxShadow={`0px 0px 20px #cb31bf,
                                                            0px 0px 30px ${selectedColor}`}
                                        transform={`matrix(0.89, 0, -0.58, 1, 0, 0)`}
                                        sx={{
                                            "> p": {
                                                transform: "matrix(1, 0, 0.58, 1, 0, 0)",
                                            },
                                        }}
                                        isLoading={loading}
                                        disabled={emailInvalid || quantity == 0 }
                                        onClick={handlePurchase}
                                    >
                                        <Text>Purchase ${price * quantity}</Text>
                                    </Button>
                                </VStack>
                            )}
                                                            {!saleOpen && 
                                // Sale will open at challengeData.start_time
                                <Text textAlign="center">Challenge Opens {moment(challengeData.start_time).format("MMMM Do @ h:mm a")}</Text>
}
                            <Box
                                borderColor={"blue.500"}
                                bgColor="viBlueTransparent"
                                borderRadius="10px"
                                borderWidth="1px"
                                m="4"
                                p="2"
                                backdropFilter={"blur(10px)"}
                            >
                                <Heading size="lg" textAlign="center" pb="2">
                                    Verified Fan Guarantee
                                </Heading>
                                <Text textAlign="center">
                                    {" "}
                                    {challengeData && challengeData.name} can choose any school, but 
                                    if {challengeData && challengeData.name} commits to a school
                                    you didn't select, you can return your card 
                                    and get 100% back to support another recruit.
                                </Text>
                            </Box>
                        </MotionBox>
                        <VStack pb={8} spacing={4} maxW={["95%", "400px", "500px"]}>
                            <Heading size="lg" textAlign="center">
                                How It Works
                            </Heading>
                                <Text fontSize="xl">Show your fandom!</Text>        
                                 <Box px={["8","8","unset"]}>    
                                <ol>
                                    <li style={{marginBottom:"10px"}}>Play the role of General Manager for your favorite team and show your support for {challengeData && challengeData.name} by buying as many collectibles as you want.</li>
                                    <li style={{marginBottom:"10px"}}>Just like a GM, your job is not over once {challengeData && challengeData.name} commits, you can still purchase cards for any listed team until we close the challenge.</li>
                                    <li style={{marginBottom:"10px"}}>{challengeData && challengeData.name} keeps {challengeData && challengeData.percentage}% of all final sales. </li>
                                    <li style={{marginBottom:"10px"}}>When {challengeData && challengeData.name} makes the big play that wins your team the conference championship, you will get credit for being a 
                                    part of his journey.</li>
                                    <li>When {challengeData && challengeData.name} makes it big, you can sell your digital collectible on our marketplace.</li>
                                </ol>
                                </Box>  
                            
                            <Heading size="lg" textAlign="center">
                                What You Get
                            </Heading>
                            <Text>
                                With Each Purchase you receive:
                                </Text>
                                <ul>
                                <li>1 Augmented Reality Card</li>
                                <li>1 Digital Collectible - One of Three Rarities, personally designed by {challengeData && challengeData.name}</li>
                                </ul>
                            
                            <Heading size="lg" textAlign="center">
                                AR Card
                            </Heading>
                            <Text>
                                {" "}
                                Show off your Digital Collectible IRL with our physical AR Card.
                            </Text>
                            <Box width={["300px", "400px"]}>
                                <video width="100%" autoPlay loop muted playsInline>
                                    <source
                                        src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-safari.mp4"
                                        type='video/mp4; codecs="hvc1"'
                                    />
                                    <source
                                        src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-vp9-chrome.webm"
                                        type="video/webm"
                                    />
                                </video>
                            </Box>
                            <Heading size="lg" textAlign="center">
                                One of Three Rarities
                            </Heading>
                            <Text>
                                {" "}
                                Each purchase gives you a chance to pull a Legendary or Rare
                                Digital Collectible
                            </Text>

                            <Stack
                                textAlign={"start"}
                                py={6}
                                direction={["column", "column", "row"]}
                                minWidth={[350, 350, 600]}
                                gridGap={4}
                            >
                                <Image
                                    src="/img/tap.svg"
                                    alt="tap"
                                    position={"absolute"}
                                    w="50px"
                                    left={["60%", "55%", "unset"]}
                                />
                                {nfts && <StaticCard nft_id={nfts[2]} width={150} />}
                                <Box px={4}>
                                    <Heading size="md" pb={3}>
                                        Legendary - 4%
                                    </Heading>
                                    <Text color="gray.400">
                                        Marked with a gold border, glow, name and signature.
                                    </Text>
                                    <Text pt={2} fontWeight="900" fontSize="lg">
                                        Utility
                                    </Text>
                                    <ul>
                                    <li>The most exclusive digital collectible</li>
                                    <li>Maximum utility in future challenges</li>
                                    </ul>
                                </Box>
                            </Stack>
                            <Stack
                                textAlign={"start"}
                                py={6}
                                direction={["column", "column", "row"]}
                                minWidth={[350, 350, 600]}
                                gridGap={4}
                            >
                                {nfts && <StaticCard nft_id={nfts[1]} width={150} />}
                                <Box px={4}>
                                    <Heading size="md" pb={3}>
                                        Rare - 12%
                                    </Heading>
                                    <Text color="gray.400">
                                        Marked with a silver border, and silver name.
                                    </Text>
                                    <Text pt={2} fontWeight="900" fontSize="lg">
                                        Utility
                                    </Text>
                                    <ul>
                                    <li>Exclusive digital collectible</li>
                                    <li>Enhanced utility in future challenges</li>
                                    </ul>
                                </Box>
                            </Stack>
                            <Stack
                                textAlign={"start"}
                                py={6}
                                direction={["column", "column", "row"]}
                                minWidth={[350, 350, 600]}
                                gridGap={4}
                            >
                                {nfts && <StaticCard nft_id={nfts[0]} width={150} />}
                                <Box px={4}>
                                    <Heading size="md" pb={3}>
                                        Common - 84%
                                    </Heading>
                                    <Text color="gray.400">
                                        Those that don't win a Rare or Legendary will receive a
                                        Common.{" "}
                                    </Text>
                                </Box>
                            </Stack>
                        </VStack>
                    </VStack>
                </Box>
            </Box>
            {meta}
        </>
    );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const id = context.query.id;

    const { data: challenge_data } = await supabase
        .from("fan_challenge")
        .select("*")
        .match({ id: id })
        .single();    

    if (challenge_data) {
        const nft_id = challenge_data.nfts[0].nft_id

        const {publicUrl} = await getScreenshot(parseInt(nft_id))

        const { data } = await supabase.rpc("fc_leaderboard", {
            _teams: challenge_data.teams,
            _fc_id: challenge_data.id,
        });

        return {
            props: {
                id,
                challenge_data,
                leaderboard: data,
                public_url: publicUrl
            },
        };
    }

    return {
        redirect: {
            destination: "/",
            permanent: false,
          },
    };
}

export default Challenge;
