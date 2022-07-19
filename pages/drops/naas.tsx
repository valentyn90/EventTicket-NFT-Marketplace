import Card from "@/components/NftCard/Card";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { Box, HStack, Image, Text, VStack, Heading, Icon, Button, IconButton, Alert, AlertIcon, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, Input, Divider, Stack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Flex, Skeleton } from "@chakra-ui/react";
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


interface Props {
    orig_price: number,
    orig_next_price: number,
    items_left: number,
    max_purchase_quantity: number,
    sale_open: boolean,
    presale_open: boolean,
}

const Auction: React.FC<Props> = ({ orig_price, orig_next_price, items_left, max_purchase_quantity, sale_open, presale_open }) => {


    // Show the card
    // Split screen into two halves
    // Left Side is purchase
    // Right Side is auction
    // &wl=true

    const [showBuyNow, setShowBuyNow] = useState(true);
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [saleOpen, setSaleOpen] = useState(sale_open);
    const [presaleOpen, setPresaleOpen] = useState(presale_open);
    const [wlAccess, setWlAccess] = useState(false);

    const [purchaseQuantity, setPurchaseQuantity] = useState(1);
    const [incrementEnabled, setIncrementEnabled] = useState(true);
    const [decrementEnabled, setDecrementEnabled] = useState(false);
    const [price, setPrice] = useState(orig_price);
    const [nextPrice, setNextPrice] = useState(orig_next_price);

    const [maxQuantity, setMaxQuantity] = useState(Math.min(max_purchase_quantity, items_left));
    const [itemsLeft, setItemsLeft] = useState(items_left);

    const [email, setEmail] = useState("");
    const [emailInvalid, setEmailInvalid] = useState(true);
    const [showEmail, setShowEmail] = useState(false);

    const [auctionData, setAuctionData] = useState<any>();
    const [invalidInput, setInvalidInput] = useState(false);
    const [showBidEmail, setShowBidEmail] = useState(false);
    const [bidAmount, setBidAmount] = useState<number>();
    const [minBidAmount, setMinBidAmount] = useState(0);
    const [minIncrement, setMinIncrement] = useState(0);
    const [auctionLoading, setAuctionLoading] = useState(true);

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
        if (maxQuantity === 0) {
            setIncrementEnabled(false);
            setDecrementEnabled(false);
        }
        else if (purchaseQuantity >= maxQuantity) {
            // setPurchaseQuantity(maxQuantity);
            setIncrementEnabled(false)
        } else
            if (purchaseQuantity < 1 && maxQuantity > 0) {
                setPurchaseQuantity(1);
            } else
                if (purchaseQuantity === 1) {
                    setDecrementEnabled(false);
                    setIncrementEnabled(true);
                } else {
                    setDecrementEnabled(true);
                    setIncrementEnabled(true);
                }

    }, [purchaseQuantity, maxQuantity]);

    useEffect(() => {
        if (showBuyNow) {
            var CE_SNAPSHOT_NAME = "Naas Drop";
        }
        else {
            var CE_SNAPSHOT_NAME = "Naas Auction";
        }

    }, [showBuyNow]);

    useEffect(() => {
        supabase.from('configurations:key=eq.naas_drop').on("UPDATE",
            (payload) => {
                console.log("naas_drop updated");
                if (payload.new.value) {
                    setMaxQuantity(Math.min(payload.new.value.max_purchase_quantity, payload.new.value.items_left));
                    setPrice(payload.new.value.current_price);
                    setItemsLeft(payload.new.value.items_left);
                    setNextPrice(payload.new.value.next_price);
                    setSaleOpen(payload.new.value.sale_open);
                    setPresaleOpen(payload.new.value.presale_open);
                }
            }
        ).subscribe()
    }, []);

    useEffect(() => {
        if (purchaseQuantity > maxQuantity) {
            setPurchaseQuantity(maxQuantity);
            toast({
                position: "top",
                title: "Selling Out at This Price",
                description: "Only " + maxQuantity + " left at this price.",
            })
        }

    }, [price, maxQuantity])

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

        if (showBuyNow) {

            ga.event({
                action: "conversion",
                params: {
                    send_to: 'AW-10929860785/rZfECK7b9s0DELHh4dso',
                    value: .06 * (purchaseQuantity * price),
                    currency: 'USD'
                },
            });

            mixpanel.track("Naas - Check Out", { price: price, purchaseQuantity: purchaseQuantity, total_spend: purchaseQuantity * price });

            const stripeRes = await fetch(`/api/marketplace/dropCheckout`, {
                method: "POST",
                headers: new Headers({ "Content-Type": "application/json" }),
                credentials: "same-origin",
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    user_id: confirmedUserData.user_id,
                    quantity: purchaseQuantity,
                    drop_id: 1,

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
        else // We are in the auction side
        {

            ga.event({
                action: "conversion",
                params: {
                    send_to: 'AW-10929860785/P_4GCP6gs84DELHh4dso',
                    value: .06 * (bidAmount || 0) * 0.1,
                    currency: 'USD'
                },
            });

            mixpanel.track("Naas - Bid Check Out", { price: bidAmount });


            const stripeRes = await fetch(`/api/auction/stripeAuctionRegister`, {
                method: "POST",
                headers: new Headers({ "Content-Type": "application/json" }),
                credentials: "same-origin",
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    user_id: confirmedUserData.user_id,
                    auction_id: auctionData.auction_id,
                    bid_amount: bidAmount,
                    bid_team_id: 7,
                    loser_id: null
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

    }

    //// BID HANDLERS ////

    useEffect(() => {

        const getAuctionData = async () => {
            const res = await fetch(`/api/auction/getAuctionData?auction_id=2`);
            const data = await res.json();
            setAuctionData(data);
        }
        getAuctionData();
    }, [])

    useEffect(() => {
        if (auctionData) {
            try {
                setMinIncrement(auctionData.min_increment);

                // Look at highest current bid and take the min of that and the min bid
                const highestBid = auctionData.active_bids[0].bid_amount;
                const startingMinBid = Math.max(auctionData.min_bid, highestBid);

                setMinBidAmount(startingMinBid + auctionData.min_increment);


                if ((bidAmount || 0) < startingMinBid + auctionData.min_increment) {
                    setBidAmount(startingMinBid + auctionData.min_increment)
                }

            }
            catch (err) {
                console.log(err);
                setMinBidAmount(auctionData.min_bid + auctionData.min_increment);

            }
            setAuctionLoading(false);

        }

    }, [auctionData])

    const handleBidChange = (event: any) => {
        let bid
        if (event.target) {
            bid = event.target.value
        }
        else {
            bid = event
        }
        setBidAmount(bid)
        if (bid < minBidAmount) {
            setInvalidInput(true)
            // setInputColor("red")
            // setInvalidBidMessage(`Minimum Bid is $${minBidAmount}`)
        }
        else {
            setInvalidInput(false)
            // setInputColor("white")
            // setInvalidBidMessage("")
        }
    }

    const sliderChange = (val: number) => {
        let slider_bid

        if (val < 60) {
            slider_bid = Math.floor(val / 5) * minIncrement + minBidAmount
        }
        else {
            slider_bid = Math.floor(60 / 5) * minIncrement + Math.floor((val - 60) / 2) * minIncrement * 5 + minBidAmount
        }

        handleBidChange(slider_bid)
    }

    const meta = (
        <Head>
            <title>#1 Naas Cunningham dropping his first NFT on July 19th</title>
            <meta
                property="og:title"
                key="title"
                content={`#1 Naas Cunningham dropping his first NFT on July 19th`}
            />
            <meta
                property="og:image"
                key="preview"
                content={"https://verifiedink.us/img/naas/naas-3.png"}
            />
            <meta
                property="twitter:image"
                key="twitter-image"
                content={`https://verifiedink.us/api/meta/showTwitterPreview/1160`}
            />
        </Head>
    )


    return (
        <>
            <Box py={3} align="center" alignContent={"center"}>
                <VStack>
                    <HStack gridGap={[0, 4, 8]} alignItems="flex-end" mb={3}>

                        <Box flex="1" onClick={() => { setShowBuyNow(true) }} opacity={showBuyNow ? "100%" : "20%"}>
                            <Image width="175px" src="/img/naas/naas-3.png" />
                            <Heading as="h2">Buy Now</Heading>
                            <Text>${price}</Text>
                            <Text color="gray">Extended Edition 1/500</Text>
                        </Box>


                        <Box flex="1" opacity={!showBuyNow ? "100%" : "20%"} onClick={() => { setShowBuyNow(false) }}>
                            <Image width="175px" src="/img/naas/naas-legendary-launch.png" />
                            <Heading as="h2">Bid</Heading>
                            <Text>${minBidAmount}</Text>
                            <Text color="gray">Launch Edition 1/10</Text>
                        </Box>

                    </HStack>
                    {showBuyNow ?
                        <VStack maxW={600} p={2}>
                            <Heading>Extended Edition</Heading>
                            <Text color="gray.400" textAlign="center" maxW="400px">Buy 1 of 500 Extended Edition NFTs. Each purchase will receive a Common, Rare or Legendary Card.</Text>
                            <HStack gridGap={10}>
                                <HStack>
                                    <IconButton size="md" isDisabled={!decrementEnabled} isRound={true} aria-label="Decrement Quantity" icon={<MinusIcon />} onClick={() => setPurchaseQuantity(purchaseQuantity - 1)}></IconButton>
                                    <VStack>
                                        <Text fontSize="5xl" pb="0">{purchaseQuantity}</Text>
                                        <Text mt="-10px !important" >Quantity</Text>
                                    </VStack>
                                    <IconButton size="md" isDisabled={!incrementEnabled} isRound={true} aria-label="Increment Quantity" icon={<AddIcon />} onClick={() => setPurchaseQuantity(purchaseQuantity + 1)}></IconButton>
                                </HStack>
                                <Text fontSize="5xl" pb="0">${price}</Text>
                            </HStack>
                            <div></div>

                            {!saleOpen && !wlAccess &&
                                <Button disabled={true} size="lg" fontSize={"xl"} minW="200px" background="blue">
                                    Public Sale Opens 7:00 PM EST
                                </Button>

                            }

                            {(saleOpen || wlAccess) && maxQuantity > 0 &&

                                <Button disabled={purchaseQuantity < 1 || showEmail} onClick={() => { setShowEmail(true) }} size="lg" fontSize={"xl"} minW="200px" background="blue">
                                    Buy &nbsp;&nbsp;${price * purchaseQuantity}
                                </Button>
                            }
                            {maxQuantity > 0 ?
                                (saleOpen || wlAccess) && <Text fontStyle="italic" color="red.500">
                                    Only {itemsLeft} left before price increases to ${nextPrice}
                                </Text>
                                :
                                <Box bgColor="blue.200" p={4} borderRadius={3}>

                                    We're all sold out at the moment. More coming soon!

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
                                <StaticCard nft_id={1160} width={150} />
                                <Box px={4}>
                                    <Heading size="md" pb={3}>Legendary - 15 Total</Heading>
                                    <Text color="gray.400">Marked with a gold border, glow, name and signature with the Legendary Naas Image.</Text>
                                    <Text pt={2} fontWeight="900" fontSize="lg">Utility</Text>
                                    <li>Follow by Naas on Instgram/Twitter</li>
                                    <li>Shoutout by Naas on Instagram/Twitter</li>
                                    <li>1 in 15 chance to win a Launch Edition</li>
                                    <li>Physical AR card in the mail</li>
                                    <li>NFT Personally Designed by Naas</li>
                                </Box>
                            </Stack>
                            <Stack textAlign={"start"} py={6} direction={["column", "column", "row"]} minWidth={350} gridGap={4} >
                                <StaticCard nft_id={1161} width={150} />
                                <Box px={4}>
                                    <Heading size="md" pb={3}>Rare - 40 Total</Heading>
                                    <Text color="gray.400">Marked with a silver border, silver name and the Rare Naas Image.</Text>
                                    <Text pt={2} fontWeight="900" fontSize="lg">Utility</Text>
                                    <li>Follow by Naas on Instgram/Twitter</li>
                                    <li>Physical AR card in the mail</li>
                                    <li>NFT Personally Designed by Naas</li>
                                </Box>
                            </Stack>
                            <Stack textAlign={"start"} py={6} direction={["column", "column", "row"]} minWidth={350} gridGap={4} >
                                <StaticCard nft_id={1162} width={150} />
                                <Box px={4}>
                                    <Heading size="md" pb={3}>Common - 445 Total</Heading>
                                    <Text color="gray.400">Those that don't win a Rare or Legendary will receive a Common. Marked with Naas's Signature and the Common Naas Image.</Text>
                                    <Text pt={2} fontWeight="900" fontSize="lg">Utility</Text>
                                    <li>Physical AR card in the mail</li>
                                    <li>NFT Personally Designed by Naas</li>
                                </Box>
                            </Stack>



                        </VStack>
                        :
                        <VStack maxW={600} p={2}>
                            <Heading>Launch Edition</Heading>
                            <Text color="gray.400" textAlign="left" maxW="400px" p={2}>
                                Bid to win the #1 / 10 Launch Edition NFT. Naas Cunningham's Ultimate Rookie NFT is the
                                most unique collectible for a projected future NBA lottery pick. Sporting an animated action shot and unqiue utility.
                                Bid to be the owner of the very first Legendary Launch Edition NFT.
                            </Text>
                            <Skeleton isLoaded={!auctionLoading}>
                                <HStack justifyContent={"center"} gridGap="2">
                                    <Stack maxW="600px" >
                                        <Text pt="2" style={{ position: "absolute" }} fontSize="2xl">$</Text>
                                        <Input variant='flushed' textAlign="center" placeholder={`Min Bid: ${minBidAmount}`} fontSize={["xl", "2xl"]} value={bidAmount} onChange={handleBidChange} />
                                        {/* <Text mt="0" fontSize="sm" textAlign="center">{invalidBidMessage}</Text> */}
                                        <Slider aria-label='slider-ex-1' defaultValue={0} onChange={(val) => sliderChange(val)}>
                                            <SliderTrack>
                                                <SliderFilledTrack />
                                            </SliderTrack>
                                            <SliderThumb ref={ref} boxSize={10} />
                                        </Slider>

                                    </Stack>
                                    {!(!saleOpen && !wlAccess) &&
                                        <Button backgroundColor={"#0067ff"} disabled={invalidInput || !bidAmount || showBidEmail} onClick={() => setShowBidEmail(true)}>Bid</Button>
                                    }
                                </HStack>

                            </Skeleton>
                            {(!saleOpen && !wlAccess) &&
                                <Button disabled={true} size="lg" fontSize={"xl"} minW="200px" background="blue">
                                    Bidding Opens 7:00 PM EST
                                </Button>
                            }
                            {showBidEmail ?
                                <>
                                    <Input autoFocus isDisabled={submitting} placeholder="Email@gmail.com" value={email} disabled={false}
                                        onChange={(e) => setEmail(e.target.value)} />
                                    <Button isLoading={submitting} disabled={emailInvalid} onClick={handlePurchase}>Place Bid</Button>
                                </>
                                :
                                null
                            }
                            <Divider pt={2} pb={8} />
                            <Stack py={10} direction={["column", "column", "row"]} alignItems={"center"} gridColumnGap={10}>
                                <Box flex={1}>
                                    <Card nft_id={763} readOnly={true} nft_width={350} />
                                </Box>
                                <VStack flex={1} minW={[200, 400, 400]}>
                                    <Heading size="lg">Legendary - 10 Total</Heading>
                                    <Text fontWeight="900" fontSize="lg">Utility</Text>
                                    <Box textAlign={"left"}>
                                        <li>Exclusive early access to future Naas drops</li>
                                        <li>Free Extended Edition NFT</li>
                                        <li>Free NFTs from Future Editions</li>
                                        <li>Follow from Naas on Twitter/Instagram</li>
                                        <li>Shout out from Naas on Twitter/Instagram</li>
                                        <li>Physical AR card in the mail</li>
                                        <li>NFT Personally Designed by Naas</li>
                                    </Box>
                                </VStack>
                            </Stack>
                        </VStack>
                    }

                    <Divider pt={5} maxW={["80%", "600px", "600px"]} />
                    <Heading as="h2" pt={5} size="lg">Augmented Reality Physical Card</Heading>
                    <Text color="gray.300" p={2}>Each purchase entitles you to a free AR card shipped anywhere in the US</Text>
                    {/* <Image src={'/img/VerifiedInk.gif'} w={["200px", "200px", "300px"]} alt="AR Card" /> */}
                    <video muted autoPlay playsInline loop src="/img/ar-card.mp4" width={300}></video>

                    {/* <Divider pt={5} maxW={["80%", "600px", "600px"]} />
                    <Heading as="h2" pt={5} size="lg">More About Naas</Heading> */}

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

    cookies.set("redirect-link", `drops/naas`, {
        maxAge: 1000 * 60 * 60,
    });

    const { data: priceData, error: priceError } = await supabase.from('configurations').select('value').eq('key', 'naas_drop').maybeSingle()


    return {
        props: {
            orig_price: priceData.value.current_price,
            orig_next_price: priceData.value.next_price,
            items_left: priceData.value.items_left,
            max_purchase_quantity: priceData.value.max_purchase_quantity,
            sale_open: priceData.value.sale_open,
            presale_open: priceData.value.presale_open,
        }
    };
}