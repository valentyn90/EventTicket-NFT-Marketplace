import Card from "@/components/NftCard/Card";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { Box, HStack, Image, Text, VStack, Heading, Icon, Button, IconButton, Alert, AlertIcon, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, Input, Divider, Stack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Flex, Skeleton, Spacer } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Cookies from "cookies";
import { supabase } from "@/supabase/supabase-client";
import { CannotExchangeSOLForSolError } from "@metaplex-foundation/mpl-auction-house/dist/src/generated";
import { getUserDetailsByEmail } from "@/supabase/userDetails";
import validateEmail from "@/utils/validateEmail";
import Head from "next/head";
import Link from "next/link";
import StaticCard from "@/components/NftCard/StaticCard";
import * as ga from "@/utils/ga";
import mixpanel from 'mixpanel-browser';
import { useRouter } from "next/router";
import moment from "moment";


interface Props {
    drop_data: any;
}

const Auction: React.FC<Props> = ({ drop_data }) => {


    // Show the card
    // Split screen into two halves
    // Left Side is purchase
    // Right Side is auction
    // &wl=true

    const [showBuyNow, setShowBuyNow] = useState(true);
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [saleOpen, setSaleOpen] = useState(false);
    const [presaleOpen, setPresaleOpen] = useState(true);
    const [wlAccess, setWlAccess] = useState(false);

    const [purchaseQuantity, setPurchaseQuantity] = useState(1);
    const [incrementEnabled, setIncrementEnabled] = useState(true);
    const [decrementEnabled, setDecrementEnabled] = useState(false);
    const [price, setPrice] = useState(drop_data.price.standard);

    const [maxQuantity, setMaxQuantity] = useState(500);
    const [itemsLeft, setItemsLeft] = useState(drop_data.quantity_left.standard);

    const [premiumPurchaseQuantity, setPremiumPurchaseQuantity] = useState(1);
    const [premiumIncrementEnabled, setPremiumIncrementEnabled] = useState(true);
    const [premiumDecrementEnabled, setPremiumDecrementEnabled] = useState(false);
    const [premiumPrice, setPremiumPrice] = useState(drop_data.price.premium);
    const [premiumItemsLeft, setPremiumItemsLeft] = useState(drop_data.quantity_left.premium);


    const [email, setEmail] = useState("");
    const [emailInvalid, setEmailInvalid] = useState(true);
    const [showEmail, setShowEmail] = useState(false);

    const [dropData, setDropData] = useState(drop_data);


    const ref = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (router) {
            if (router.query.wl) {
                presaleOpen ? setWlAccess(true) : null
            }
        }

    }, [router, presaleOpen])

    useEffect(() => {
        console.log(dropData)
        if(dropData){
            (new Date(dropData.drop_start).valueOf() < Date.now() && !dropData.drop_ended) ? setSaleOpen(true) : setSaleOpen(false);
        }

    },[dropData])

    useEffect(() => {
        if (purchaseQuantity === 1) {
            setDecrementEnabled(false);
            setIncrementEnabled(true);
        }
        if (premiumPurchaseQuantity === 1) {
            setPremiumDecrementEnabled(false);
            setPremiumIncrementEnabled(true);
        }
        if (purchaseQuantity > 1) {
            setDecrementEnabled(true);
        }
        if (premiumPurchaseQuantity > 1) {
            setPremiumDecrementEnabled(true);
        }
        if (purchaseQuantity >= itemsLeft) {
            setPurchaseQuantity(itemsLeft);
            setIncrementEnabled(false);
        }
        else {
            setIncrementEnabled(true);
        }
        if (premiumPurchaseQuantity >= premiumItemsLeft) {
            setPremiumPurchaseQuantity(premiumItemsLeft);
            setPremiumIncrementEnabled(false);
        }
        else {
            setPremiumIncrementEnabled(true);
        }
    }, [purchaseQuantity, itemsLeft, premiumPurchaseQuantity, premiumItemsLeft]);

    useEffect(() => {
        if (showBuyNow) {
            //@ts-ignore
            window.CE_SNAPSHOT_NAME = "Naas Drop";
        }
        else {
            //@ts-ignore
            window.CE_SNAPSHOT_NAME = "Naas Auction";
        }

    }, [showBuyNow]);

    useEffect(() => {
        supabase.from(`drop:id=eq.` + drop_data.id).on("UPDATE",
            (payload) => {
                console.log("drop updated");
                if (payload.new) {
                    setItemsLeft(payload.new.quantity_left.standard);
                    setPremiumItemsLeft(payload.new.quantity_left.premium);
                }
            }
        ).subscribe()
    }, []);


    useEffect(() => {
        if (email.trim().length != email.length) {
            setEmail(email.trim())
            return
        }
        const valid = validateEmail(email)
        if (!valid) {
            setEmailInvalid(true)
        }
        else {
            setEmailInvalid(false)
        }
    }, [email])


    async function handlePurchase(e: any) {
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
                value: .06 * (purchaseQuantity * price),
                currency: 'USD'
            },
        });

        mixpanel.track("Drop - Check Out", { id: dropData.id, price: price, purchaseQuantity: purchaseQuantity, total_spend: purchaseQuantity * price });

        const stripeRes = await fetch(`/api/marketplace/dropCheckout`, {
            method: "POST",
            headers: new Headers({ "Content-Type": "application/json" }),
            credentials: "same-origin",
            body: JSON.stringify({
                email: email.toLowerCase(),
                user_id: confirmedUserData.user_id,
                quantity: showBuyNow ? purchaseQuantity : premiumPurchaseQuantity,
                drop_id: dropData.id,
                nft_type: showBuyNow ? "standard" : "premium"

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


    const meta = (
        <Head>
            <title>{drop_data.player_name} dropping his first NFT on VerifiedInk</title>
            <meta
                property="og:title"
                key="title"
                content={`${drop_data.player_name} dropping his first NFT on VerifiedInk`}
            />
            <meta
                property="og:image"
                key="preview"
                content={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/drops/${drop_data.id}-standard.png`}
            />
            <meta
                property="twitter:image"
                key="twitter-image"
                content={`https://verifiedink.us/api/meta/showTwitterPreview/${drop_data.nfts[0]}`}
            />
            {/* <meta property="og:video" content="https://verifiedink.us/img/naas/naas-card.mp4" />
            <meta property="og:video:type" content="video/mp4" />
            <meta property="og:video:width" content="720" />
            <meta property="og:video:height" content="720" /> */}
        </Head>
    )


    return (
        <>
            <Box py={3} align="center" alignContent={"center"}>
                <Spacer h="56px" />
                <VStack>
                    <HStack gridGap={[0, 4, 8]} alignItems="flex-start" mb={3}>

                        <Box flex="1" onClick={() => { setShowBuyNow(true) }} opacity={showBuyNow ? "100%" : "20%"}>
                            <Image h="233px" w="175px" maxWidth="unset" src={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/drops/${dropData.id}-standard.png?update`} />
                            <Heading as="h2">Buy Now</Heading>
                            <Text>${price}</Text>
                            <Text color="gray">Extended Edition 1/500</Text>
                        </Box>


                        <Box flex="1" opacity={!showBuyNow ? "100%" : "20%"} onClick={() => { setShowBuyNow(false) }}>
                            <Image h="233px" src={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/drops/${dropData.id}-premium.png?update`} />
                            <Heading as="h2">1 of 10</Heading>
                            <Text>${dropData.price.premium}</Text>
                            <Text color="gray">Launch Edition 1/10</Text>
                        </Box>

                    </HStack>
                    {showBuyNow ?
                        <VStack maxW={600} p={2}>
                            <Heading>Extended Edition</Heading>
                            <Text px={3} bg="#ececec" borderRadius={20} color="gray.800">80%+ of Sales go directly to {dropData.player_name.split(" ")[0]}</Text>
                            <Text color="gray.300" textAlign="center" maxW="400px">Buy 1 of 500 Extended Edition Digital Collectibles. Each purchase will receive a Legendary, Rare or Common Card.</Text>
                            <HStack gridGap={10}>
                                <HStack>
                                    <IconButton size="md" isDisabled={!decrementEnabled || !saleOpen} isRound={true} aria-label="Decrement Quantity" icon={<MinusIcon />} onClick={() => setPurchaseQuantity(purchaseQuantity - 1)}></IconButton>
                                    <VStack>
                                        <Text fontSize="5xl" pb="0">{purchaseQuantity}</Text>
                                        <Text mt="-10px !important" >Quantity</Text>
                                    </VStack>
                                    <IconButton size="md" isDisabled={!incrementEnabled || !saleOpen} isRound={true} aria-label="Increment Quantity" icon={<AddIcon />} onClick={() => setPurchaseQuantity(purchaseQuantity + 1)}></IconButton>
                                </HStack>
                                <Text fontSize="5xl" pb="0">${price}</Text>
                            </HStack>
                            <div></div>

                            {itemsLeft > 0 &&

                                <Button disabled={purchaseQuantity < 1 || showEmail || !saleOpen} onClick={() => { setShowEmail(true) }} size="lg" pb="4px" color="white" fontSize={"xl"} minW="200px" colorScheme="blue">
                                    Buy &nbsp;&nbsp;${price * purchaseQuantity}
                                </Button>
                            }
                            {!saleOpen && !dropData.sale_ended &&
                                <Text color="gray.300" textAlign="center" maxW="400px">Drop Opens {moment(dropData.drop_start).format("MMMM Do YYYY, h:mm a")}</Text>
                            }
                            {!saleOpen && dropData.sale_ended &&
                                <Text color="gray.300" textAlign="center" maxW="400px">Drop Ended</Text>
                            }
                            {itemsLeft > 0 ?
                                (saleOpen || wlAccess) &&
                                <Box>

                                    <Text fontStyle="italic" color="red.500">
                                        Only {itemsLeft} left
                                    </Text>
                                </Box>
                                :
                                <Box bgColor="blue.200" p={4} borderRadius={3}>

                                    We're all sold out!

                                </Box>
                            }
                            {showEmail ?
                                <>
                                    <Input autoFocus isDisabled={submitting} placeholder="Email@gmail.com" value={email} disabled={false}
                                        onChange={(e) => setEmail(e.target.value)} />
                                    <Button isLoading={submitting} disabled={emailInvalid} onClick={handlePurchase}>Purchase</Button>
                                </>
                                :
                                null
                            }
                            <Divider pt={2} />
                            <Heading pt={4} px={2} as="h3" alignSelf={"start"} size="lg">Buying Gives you a Chance to Win</Heading>

                            <Stack textAlign={"start"} py={6} direction={["column", "column", "row"]} minWidth={350} gridGap={4} >
                                <Image src="/img/tap.svg" alt="tap" position={"absolute"} w="50px" left={["60%", "55%", "unset"]} />
                                <StaticCard nft_id={dropData.nfts[2]} width={150} />
                                <Box px={4}>
                                    <Heading size="md" pb={3}>Legendary - 15 Total</Heading>
                                    <Text color="gray.400">Marked with a gold border, glow, name and signature with the Legendary {dropData.player_name.split(" ")[0]} Image.</Text>
                                    <Text pt={2} fontWeight="900" fontSize="lg">Utility</Text>
                                    {dropData.utility_video && <li>Video call with {dropData.player_name.split(" ")[0]}</li>}
                                    {dropData.utility_follow && <li>Follow by {dropData.player_name.split(" ")[0]} on Instgram/Twitter</li>}
                                    {dropData.utility_follow && <li>Shoutout by {dropData.player_name.split(" ")[0]} on Instagram/Twitter</li>}
                                    <li>1 in 15 chance to win a Launch Edition</li>
                                    <li>Physical AR card in the mail</li>
                                    <li>Digital Collectible Personally Designed by {dropData.player_name.split(" ")[0]}</li>
                                </Box>
                            </Stack>
                            <Stack textAlign={"start"} py={6} direction={["column", "column", "row-reverse"]} minWidth={350} gridGap={4} >
                                <StaticCard nft_id={dropData.nfts[1]} width={150} />
                                <Box px={4}>
                                    <Heading size="md" pb={3}>Rare - 40 Total</Heading>
                                    <Text color="gray.400">Marked with a silver border and silver name.</Text>
                                    <Text pt={2} fontWeight="900" fontSize="lg">Utility</Text>
                                    {dropData.utility_follow && <li>Follow by {dropData.player_name.split(" ")[0]} on Instgram/Twitter</li>}
                                    <li>Physical AR card in the mail</li>
                                    <li>Digital Collectible Personally Designed by {dropData.player_name.split(" ")[0]}</li>
                                </Box>
                            </Stack>
                            <Stack textAlign={"start"} py={6} direction={["column", "column", "row"]} minWidth={350} gridGap={4} >
                                <StaticCard nft_id={dropData.nfts[0]} width={150} />
                                <Box px={4}>
                                    <Heading size="md" pb={3}>Common - 445 Total</Heading>
                                    <Text color="gray.400">Those that don't win a Rare or Legendary will receive a Common. Marked with {dropData.player_name.split(" ")[0]}'s Signature.</Text>
                                    <Text pt={2} fontWeight="900" fontSize="lg">Utility</Text>
                                    <li>Physical AR card in the mail</li>
                                    <li>Digital Collectible Personally Designed by {dropData.player_name.split(" ")[0]}</li>
                                </Box>
                            </Stack>



                        </VStack>
                        :
                        <VStack maxW={600} p={2}>
                            <Heading>Launch Edition</Heading>
                            <Text px={3} bg="#ececec" borderRadius={20} color="gray.800">80%+ of Sales go directly to {dropData.player_name.split(" ")[0]}</Text>
                            <Text color="gray.300" textAlign="center" maxW="400px" p={2}>
                                Own 1 of only 10 Launch Edition Legendary Digital Collectibles. <br></br>This is {dropData.player_name.split(" ")[0]}'s ultimate rookie card.
                            </Text>

                            <HStack gridGap={10}>
                                <HStack>
                                    <IconButton size="md" isDisabled={!premiumDecrementEnabled} isRound={true} aria-label="Decrement Quantity" icon={<MinusIcon />} onClick={() => setPremiumPurchaseQuantity(premiumPurchaseQuantity - 1)}></IconButton>
                                    <VStack>
                                        <Text fontSize="5xl" pb="0">{premiumPurchaseQuantity}</Text>
                                        <Text mt="-10px !important" >Quantity</Text>
                                    </VStack>
                                    <IconButton size="md" isDisabled={!premiumIncrementEnabled} isRound={true} aria-label="Increment Quantity" icon={<AddIcon />} onClick={() => setPremiumPurchaseQuantity(premiumPurchaseQuantity + 1)}></IconButton>
                                </HStack>
                                <Text fontSize="5xl" pb="0">${premiumPrice}</Text>
                            </HStack>
                            <div></div>


                            {(saleOpen || wlAccess) && premiumItemsLeft > 0 &&

                                <Button disabled={premiumPurchaseQuantity < 1 || showEmail} onClick={() => { setShowEmail(true) }} size="lg" pb="4px" color="white" fontSize={"xl"} minW="200px" colorScheme="blue">
                                    Buy &nbsp;&nbsp;${premiumPrice * premiumPurchaseQuantity}
                                </Button>
                            }
                            {maxQuantity > 0 ?
                                (saleOpen || wlAccess) &&
                                <Box>

                                    <Text fontStyle="italic" color="red.500">
                                        Only {premiumItemsLeft} left
                                    </Text>
                                </Box>
                                :
                                <Box bgColor="blue.200" p={4} borderRadius={3}>

                                    We're all sold out!

                                </Box>
                            }
                            {showEmail ?
                                <>
                                    <Input autoFocus isDisabled={submitting} placeholder="Email@gmail.com" value={email} disabled={false}
                                        onChange={(e) => setEmail(e.target.value)} />
                                    <Button isLoading={submitting} disabled={emailInvalid} onClick={handlePurchase}>Purchase</Button>
                                </>
                                :
                                null
                            }

                            <Divider pt={2} pb={8} />
                            <Stack py={10} direction={["column", "column", "row"]} alignItems={"center"} gridColumnGap={10}>
                                <Box flex={1}>
                                    <Card nft_id={dropData.premium_nft} readOnly={true} nft_width={350} />
                                </Box>
                                <VStack flex={1} minW={[200, 400, 400]}>
                                    <Heading size="lg">Legendary - 10 Total</Heading>
                                    <Text fontWeight="900" fontSize="lg">Utility</Text>
                                    <Box textAlign={"left"}>
                                        {dropData.utility_video && <li>Video call with {dropData.player_name.split(" ")[0]}</li>}
                                        {dropData.utility_follow &&<li>Follow from {dropData.player_name.split(" ")[0]} on Twitter/Instagram</li>}
                                        {dropData.utility_follow &&<li>Shout out from {dropData.player_name.split(" ")[0]} on Twitter/Instagram</li>}
                                        <li>Physical AR card in the mail</li>
                                        <li>Digital Collectible Personally Designed by {dropData.player_name.split(" ")[0]}</li>
                                    </Box>
                                </VStack>
                            </Stack>
                        </VStack>
                    }

                    <Divider pt={5} maxW={["80%", "600px", "600px"]} />
                    <Heading as="h2" pt={5} size="lg">Augmented Reality Physical Card</Heading>
                    <Text color="gray.300" p={2}>Each purchase entitles you to a free AR card shipped anywhere in the US</Text>
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


                    <Divider pt={2} maxW={["80%", "600px", "600px"]} />
                    <Heading pt={4} as="h3" size="lg">More About VerifiedInk</Heading>
                    <Text py={3} textAlign={"left"} maxW={["90%", "600px", "600px"]}>
                        If you'd like to learn more about the VerifiedInk platform and our plans, please
                        visit our Overview, read through the FAQs, or just reach out by clicking the blue
                        help button in the corner.
                    </Text>
                    <HStack>
                        <Link href="/blog">
                            <Button>Verified Overview</Button>
                        </Link>
                        <Link href="/faq">
                            <Button>FAQ</Button>
                        </Link>
                    </HStack>
                </VStack>

            </Box>
            {meta}
        </>
    )
}

export default Auction;

export async function getServerSideProps(context: any) {
    const cookies = new Cookies(context.req, context.res);

    const { data: priceData, error: priceError } = await supabase.from('configurations').select('value').eq('key', 'naas_drop').maybeSingle()

    const { data: dropData } = await supabase.from('drop').select('*').eq('id', context.query.id).maybeSingle()

    console.log(dropData)

    return {
        props: {
            drop_data: dropData,
        }
    };
}
