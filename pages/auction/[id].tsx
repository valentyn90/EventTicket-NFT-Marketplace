import StaticCard from "@/components/NftCard/StaticCard";
import { getScreenshot, supabase } from "@/supabase/supabase-client";
import { getUserDetailsByEmail } from "@/supabase/userDetails";
import validateEmail from "@/utils/validateEmail";
import { Text, Grid, Heading, Spinner, Stack, SimpleGrid, Box, Image, HStack, Input, Button, VStack, InputGroup, InputLeftElement, Popover, PopoverTrigger, PopoverContent, PopoverArrow, useBoolean, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Slider, SliderTrack, SliderFilledTrack, SliderThumb, useToast, Divider, Spacer } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { Ref, useEffect, useRef, useState } from "react";
import { Form } from "rsuite";
import userStore from "@/mobx/UserStore";
import Link from "next/link";
import Cookies from "cookies";
import Head from "next/head";
import moment from "moment";
import { motion, useTransform, useViewportScroll } from "framer-motion"
import { useIntercom } from 'react-use-intercom';

var momentPreciseRangePlugin = require('moment-precise-range-plugin');
var _ = require('lodash')

interface Props {
    publicUrl?: string,
    headline?: string,
    nft_id?: number,
}

const Auction: React.FC<Props> = ({ publicUrl, headline, nft_id }) => {

    // Pull in ID

    // Get status of auction 
    // Input Bid
    // Sign in
    // Enter cc details
    // Return status, if bid is highest, or tell them they need to increase to bid
    // Ask for maximum bid 

    const [auctionData, setAuctionData] = useState<any>();
    const [auctionBars, setAuctionBars] = useState<any>();
    const [newAuctionBars, setNewAuctionBars] = useState<any>();
    const [showEmail, setShowEmail] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<any>();
    const [selectedTeamId, setSelectedTeamId] = useState<any>();
    const [bidAmount, setBidAmount] = useState<number>();
    const [invalidInput, setInvalidInput] = useState(false)
    const [invalidBidMessage, setInvalidBidMessage] = useState("")
    const [inputColor, setInputColor] = useState("white")
    const [minBidAmount, setMinBidAmount] = useState(0);
    const [minAuctionBidAmount, setMinAuctionBidAmount] = useState(0);
    const [totalBidAmount, setTotalBidAmount] = useState(100);
    const [newBids, setNewBids] = useState<any>();
    const [originalBids, setOriginalBids] = useState<any>();
    const [origWinners, setOrigWinners] = useState<any>();
    const [teams, setTeams] = useState<any>();
    const [email, setEmail] = useState("");
    const [emailInvalid, setEmailInvalid] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userId, setUserId] = useState("");
    const [existingBid, setExistingBid] = useState<any>();
    const [outbid, setOutbid] = useState(false);
    const [needToLogin, setNeedToLogin] = useState(false);
    // Cannot cancel, can revise maximum bid if it hasn't already been reached.
    const router = useRouter();
    const ref = useRef<HTMLInputElement>(null);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [reverse, setReverse] = useState(false);
    const [flipCount, setFlipCount] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState<any>();


    useEffect(() => {

        const getAuctionData = async () => {
            const res = await fetch(`/api/auction/getAuctionData?auction_id=${router.query.id}`);
            const data = await res.json();
            setAuctionData(data);
        }

        if (router.query.id) {
            getAuctionData();
        }

    }, [router])

    useEffect(() => {
        if (flipCount < 2) {
            setTimeout(() => {
                setFlipCount(flipCount + 1);
                setReverse(!reverse);
            }, 3000)
        }
        if(flipCount === 2) {
            setFlipCount(flipCount + 1);
            if(scrollY.get() < 72 && window.innerWidth < 768) {
                window.scrollTo({top: 72, behavior: 'smooth'});
            }
        }
    }, [reverse])

    useEffect(() => {
        if (userStore.loggedIn && auctionData) {
            setUserId(userStore.id);
            setEmail(userStore.email);
            lookupExistingBid(userStore.id);
        }
        else if (router.query.user_id) {
            setUserId(router.query.user_id! as string);
        }

    }, [userStore.loaded, auctionData])

    useEffect(() => {

        if (router.query.team_id && auctionData) {
            const selected_team = auctionData.auction_teams.find((team: any) => team.id == router.query.team_id)
            setSelectedTeam(selected_team.logo_link)
            setSelectedTeamId(selected_team.id)

        }
    }, [auctionData])



    useEffect(() => {
        if (auctionData) {
            const orig_bids = aggregate_bids(auctionData.active_bids)
            setOriginalBids(orig_bids);

            const content = createBars(orig_bids)
            setAuctionBars(content);

            const orig_winners = auctionData.active_bids.map((bid: any) => { return bid.user_id })
            setOrigWinners(orig_winners);

            const minBid = auctionData.min_increment + auctionData.active_bids.reduce((min: any, p: any) => p.bid_amount < min ? p.bid_amount : min, auctionData.active_bids[0].bid_amount)
            if (minBidAmount < minBid) {
                setMinBidAmount(minBid)
                setMinAuctionBidAmount(minBid)
            }
            const total_bids = auctionData.active_bids.reduce((total: any, p: any) => total + p.bid_amount, 0)
            setTotalBidAmount(total_bids)

            if (!selectedTeam && !router.query.team_id) {
                const rand_team = Math.floor(Math.random() * auctionData.auction_teams.length)
                setSelectedTeam(auctionData.auction_teams[rand_team].logo_link)
                setSelectedTeamId(auctionData.auction_teams[rand_team].id)
            }

        }

    }, [auctionData])

    function createBars(input_bids: any) {

        const bids = aggregate_bids(input_bids)

        const orig_bids = originalBids ? originalBids : aggregate_bids(auctionData.active_bids)


        const ordered_bids = _.orderBy(bids, ['bid_amount'], ['desc']).map((bid: any) => parseInt(bid.bid_team_id))

        const ordered_teams = _.sortBy(auctionData.auction_teams,
            function (team: any) {
                const order = ordered_bids.indexOf(team.id)

                if (order == -1) {
                    return auctionData.auction_teams.length
                }
                else return order
            }
        )


        const content = (
            <SimpleGrid pt="3" columns={3} spacing='10px' rows={auctionData.auction_teams.length}>
                {ordered_teams.map((team: any, index: any) => {
                    let amount = bids.find((bid: any) => bid.bid_team_id == team.id)
                    let orig_amount = orig_bids.find((bid: any) => bid.bid_team_id == team.id)
                    if (!amount) {
                        amount = { bid_amount: 0, bid_size: .01 }
                    }
                    if (!orig_amount) {
                        orig_amount = { bid_amount: 0, bid_size: .01 }
                    }
                    let color, diff_value
                    if (amount.bid_amount > orig_amount.bid_amount) {
                        color = "green"
                        diff_value = "+$" + (amount.bid_amount - orig_amount.bid_amount).toFixed()
                    }
                    else if (amount.bid_amount < orig_amount.bid_amount) {
                        color = "red"
                        diff_value = "-$" + (orig_amount.bid_amount - amount.bid_amount).toFixed()
                    }

                    return (
                        <>
                            <Box justifySelf="center"><Image w="50px" src={team.logo_link}></Image></Box>
                            <HStack><Text alignSelf="center" fontSize="xl">${amount.bid_amount}</Text>
                                {color ? <Text alignSelf="center" fontSize="l" color={color}>{diff_value}</Text> : null}
                            </HStack>
                            <Box bg={team.color} width={`${amount.bid_size * 80}px`}></Box>
                        </>
                    )

                })}
            </SimpleGrid>
        )
        return content;

    }

    useEffect(() => {

        if (newBids) {

            const content = createBars(newBids)

            setNewAuctionBars(content);
        }

    }, [newBids])


    useEffect(() => {
        if (bidAmount && bidAmount >= minBidAmount) {
            var bids = [...auctionData.active_bids]

            let newBid = { bid_id: -1, bid_amount: Number(bidAmount), bid_team_id: selectedTeamId }

            if (existingBid && existingBid.bid_amount >= (minAuctionBidAmount - auctionData.min_increment)) {
                const switchedBid = bids.map(bid => {
                    if (bid.bid_id === existingBid.bid_id) {
                        bid.bid_amount = Number(bidAmount)
                        bid.bid_team_id = selectedTeamId
                    }
                    return { ...bid }
                })
                setNewBids(switchedBid)

            }
            else if (bids.length < auctionData.items.length) {
                bids.push(newBid)
                setNewBids(bids)
            } else {
                var bids_removed_lowest = _.orderBy(bids, ['bid_amount', 'bid_id'], ['asc', 'desc']).slice(1, bids.length)
                bids_removed_lowest.push(newBid)
                setNewBids(bids_removed_lowest)
            }

        }

    }, [bidAmount, selectedTeamId])

    function selectTeam(logo_link: string, team_id: number) {
        setSelectedTeam(logo_link)
        setSelectedTeamId(team_id)
        if (ref.current) {
            ref.current.focus()
        }
    }

    async function lookupExistingBid(user_id: string) {
        const { data: bid, error } = await supabase.from("auction_bids")
            .select("*")
            .eq("user_id", user_id)
            .eq("auction_id", router.query.id)
            .eq("status", "confirmed")

        if (bid && bid[0]) {
            const personal_min_bid = auctionData.min_increment + bid[0].bid_amount
            if (personal_min_bid > minBidAmount) {
                setMinBidAmount(personal_min_bid)
            }
            setExistingBid(bid[0])
            const selected_team = auctionData.auction_teams.find((team: any) => team.id == bid[0].bid_team_id)
            setSelectedTeam(selected_team.logo_link)
            setSelectedTeamId(selected_team.id)

            const inTheMoney = auctionData.active_bids.find((bids: any) => bids.bid_id == bid[0].bid_id)

            if (!inTheMoney) {
                setOutbid(true)
            }

        }

    }

    useEffect(() => {
        if (minAuctionBidAmount > minBidAmount) {
            setMinBidAmount(minAuctionBidAmount)
        }
    }, [minAuctionBidAmount, minBidAmount])

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
            setInputColor("red")
            setInvalidBidMessage(`Minimum Bid is $${minBidAmount}`)
        }
        else {
            setInvalidInput(false)
            setInputColor("white")
            setInvalidBidMessage("")
        }
    }

    const sliderChange = (val: number) => {

        let slider_bid

        if (val < 80) {
            slider_bid = minBidAmount + val * 5
        }
        else {
            slider_bid = minBidAmount + (80) * 5 + (val - 80) * 50
        }

        handleBidChange(slider_bid)
    }

    useEffect(() => {
        if(email.trim().length != email.length){
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

    useEffect(() => {

        if (auctionData) {
            const interval = setInterval(() => {
                // @ts-ignore
                const diff = moment.preciseDiff(moment(auctionData.end_time), moment(new Date()), true);
                if(diff.seconds){
                    setTimeRemaining(`${diff.days} days ${diff.hours}:${diff.minutes.toString().padStart(2, '0')}:${diff.seconds.toString().padStart(2, '0')}`)
                }
            }, 1000);

            return () => clearInterval(interval);
        }

    }, [auctionData])



    function aggregate_bids(bids: any[]) {

        const orig_bids = _(bids).groupBy('bid_team_id')
            .map(
                (bid: any, id: any) => ({
                    bid_team_id: id,
                    bid_amount: _.sumBy(bid, 'bid_amount')
                })
            )
            .orderBy('bid_amount', 'desc')
            .value()

        const total_bids = _.maxBy(orig_bids, 'bid_amount').bid_amount

        const bids_with_size =
            _(orig_bids).map(
                (bid: any, id: any) => ({
                    bid_team_id: bid.bid_team_id,
                    bid_amount: bid.bid_amount,
                    bid_size: bid.bid_amount / total_bids
                }
                )).value()

        return bids_with_size
    }

    async function handleBid(e: any) {
        setSubmitting(true)

        // setSubmitting(false)
        // onClose()

        // find if anyone has been outbid
        const newWinners = newBids.map((bid: any) => { return bid.user_id })

        let loser = origWinners.filter((id: any) => !newWinners.includes(id))[0]


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

        if(!confirmedUserData){
            toast({
                position: "top",
                description: "Error accessing your account - please contact support@verifiedink.us",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setSubmitting(false);

        }

        if (confirmedUserData.user_id === loser) {
            loser = null
        }


        const stripeRes = await fetch(`/api/auction/stripeAuctionRegister`, {
            method: "POST",
            headers: new Headers({ "Content-Type": "application/json" }),
            credentials: "same-origin",
            body: JSON.stringify({
                email: email.toLowerCase(),
                user_id: confirmedUserData.user_id,
                auction_id: auctionData.auction_id,
                bid_amount: bidAmount,
                bid_team_id: selectedTeamId,
                loser_id: loser
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
                    onClose()
                    if (data.status === "success") {
                        toast({
                            position: "top",
                            description: data.message,
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                        });
                        //   await lookupExistingBid(userStore.id);
                        router.reload()
                    }
                    else {
                        toast({
                            position: "top",
                            description: data.message,
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                        if (data.message.includes("You must be logged in")) {
                            setNeedToLogin(true)
                        }
                    }
                }
            })
            .catch((err) => console.log(err));

        setSubmitting(false);

    }

    const meta = (
        <Head>
            <title>Auction - {headline}</title>
            <meta
                property="og:title"
                key="title"
                content={`Bid on ${headline}'s NFT`}
            />
            <meta
                property="og:image"
                key="preview"
                content={publicUrl}
            />
            <meta
                property="twitter:image"
                key="twitter-image"
                content={`https://verifiedink.us/api/meta/showTwitterPreview/${nft_id}`}
            />
        </Head>
    )

    const exampleVariant = {
        visible: { scale: 1 },
        shrunk: { scale: 0.1 },
    }


    const { scrollY } = useViewportScroll();
    const scale = useTransform(scrollY, [0, 100], [1, .4]);
    const height = useTransform(scrollY, [0, 100], [520, 275]);

    return (
        auctionData ?
            <> {meta}
                <Stack pt={["2,", "3", "8"]} direction={['column-reverse', 'column-reverse', 'row']} alignItems={["center", "center", "flex-start"]} align={"center"} justifyContent={"center"}>
                    <Box display={["none", "none", "block"]} align="center">
                    <StaticCard public_url={publicUrl!} reverse={reverse} nft_id={auctionData.items[0].nft_id} width={375}/>
                    </Box>
                    <Stack paddingInline={["4", "4", "4"]} maxW={600} pb={[8, 8, 0]}>
                        <Box display={["block", "block", "none"]} align="center">
                            <motion.div style={{ height: height, scale: scale }} >
                                <StaticCard public_url={publicUrl!} reverse={reverse} nft_id={auctionData.items[0].nft_id} width={300} />
                            </motion.div>
                        </Box>
                        <Heading mt="4" textAlign={["center", "center", "unset"]}>Bid on My Limited Edition&nbsp;NFT</Heading>
                        <Text mt="2" dangerouslySetInnerHTML={{ __html: auctionData.description as string }}></Text>

                        <Text pt="4" fontWeight="900" color="gray.300">Auction Ends In</Text>
                        <Heading size="lg" pb="2">{timeRemaining}</Heading>
                        <Divider orientation='horizontal' />

                        <Form
                        >
                            <Heading as="h3" pt="2" size="md">Step 1 - Choose Your Team</Heading>
                            <HStack justifyContent="space-evenly" paddingBlock={4} gridGap={3} >
                                <Text ml="3">Jayden is down to 5 schools. <br></br> Which one do YOU want Jayden to sign with?</Text>
                                {auctionData && <Popover closeOnBlur={true}>

                                    <PopoverTrigger>
                                        <VStack background={"whiteAlpha.400"} p="2" borderRadius="10px" justifySelf="center" justifyContent="center" >
                                            <Image w="50px" src={selectedTeam}></Image>
                                            <Text textAlign="center">Choose Your Team ▾</Text>
                                        </VStack>
                                    </PopoverTrigger>
                                    <PopoverContent w="80px" p={2}>
                                        <PopoverArrow /><VStack justifyContent="center" gridGap={1}>
                                            {auctionData.auction_teams.map((team: any) => {
                                                return <Image key={team.id} width="80px" src={team.logo_link} onClick={() => { selectTeam(team.logo_link, team.id) }} />
                                            }
                                            )}
                                        </VStack>
                                    </PopoverContent>
                                </Popover>}
                            </HStack>
                            <Divider orientation='horizontal' />

                            <Heading as="h3" pt="4" size="md">Step 2 - Place Your Bid</Heading>
                            <Text mt="2" pb="2"> Jayden has listed 7 of his 10 Launch Edition NFTs up for Auction. <br /><br />The top 7 bids will win one of them!</Text>
                            <HStack justifyContent={"center"} gridGap="2">
                                <Stack maxW="600px" >
                                    <Text pt="2" style={{ position: "absolute" }} fontSize="2xl">$</Text>
                                    <Input variant='flushed' textAlign="center" placeholder={`Min Bid: ${minBidAmount}`} color={inputColor} fontSize={["xl", "2xl"]} isInvalid={invalidInput} value={bidAmount} onChange={handleBidChange} />
                                    <Text mt="0" fontSize="sm" textAlign="center">{invalidBidMessage}</Text>
                                    <Slider aria-label='slider-ex-1' defaultValue={0} onChange={(val) => sliderChange(val)}>
                                        <SliderTrack>
                                            <SliderFilledTrack />
                                        </SliderTrack>
                                        <SliderThumb ref={ref} boxSize={10} />
                                    </Slider>

                                </Stack>
                                <Button backgroundColor={"#0067ff"} disabled={invalidInput || !bidAmount || showEmail} onClick={() => setShowEmail(true)}>Bid</Button>
                            </HStack>
                        </Form>
                        {showEmail ?
                            <>
                                <Input placeholder="Email@gmail.com" value={email} disabled={existingBid}
                                    onChange={(e) => setEmail(e.target.value)} />
                                {
                                    needToLogin ? <Link href={`/marketplace/signin?email=${email}`}><Button isLoading={submitting} disabled={emailInvalid} onClick={() => setSubmitting(true)}>Login to Update Bid</Button></Link> :

                                        <Button disabled={emailInvalid} onClick={onOpen}>{existingBid ? "Update Bid" : "Place Bid"}</Button>}
                            </>
                            :
                            null
                        }

                        {(userStore.loggedIn && existingBid && outbid) ?
                            <Box p={3} background={"red.700"} borderRadius={3}>
                                <Heading fontSize="xl" >You've been Outbid</Heading>
                                <Text>You had succesfully placed a bid of ${existingBid.bid_amount} supporting {
                                    auctionData.auction_teams.find((team: any) => team.id == existingBid.bid_team_id).school
                                } but you've since been outbid. </Text>
                                <Text>Increase your bid if you'd like to win the Auction.</Text>

                            </Box> :
                            null

                        }
                        {(userStore.loggedIn && existingBid && !outbid) ?
                            <>
                                <Heading pt={3} fontSize="xl">Your Bid</Heading>
                                <Text>You have succesfully placed a bid of ${existingBid.bid_amount} supporting {
                                    auctionData.auction_teams.find((team: any) => team.id == existingBid.bid_team_id).school
                                }</Text>



                            </> :
                            null
                        }

                        {newAuctionBars ?
                            <><Heading pt={3} fontSize="xl">Leaderboard with Your Bid</Heading>
                                {newAuctionBars}
                            </>
                            :
                            <><Heading pt={3} fontSize="xl">Leaderboard</Heading>
                                {auctionBars}
                            </>
                        }

                        <Spacer p="5"/>

                        <Heading fontSize={"sm"}>The Details</Heading>
                        <Text fontSize={"sm"}>
                            This NFT was created by Jayden Bonsu, and all proceeds (minus a 6% platform transaction fee) go directly to Jayden.
                            <br/><br/>
                            An NFT is a non-fungible token, meaning the winning bidder will own the only version of these made available. Each is designated with a different serial number of 10.
                            <br/><br/>
                            Should you win the auction with one of the top 7 bids, VerifiedInk will either transfer the NFT to the wallet of your choice (non-custodial) or hold the NFT in your name custodially based on your decision. The serial numbers will be issued sequentially with number 1/10 going to the highest bidder, 2/10 going to the next highest bidder, and so on.
                            <br/><br/>
                            The card will appear in your personal collection on the VerifiedInk website and you are free to sell, transfer, or hold the NFT however you like and on any platform that supports the Solana blockchain.
                        </Text>
                        <Text fontSize={"xs"}>
                        VerifiedInk is not affiliated with the University of Alabama, University of Miami, The Ohio State University, Michigan State University, or Pennsylvania State University. 
                        <br/><br/>
                        All logos, product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them, and are used for informational purposes only.
                        <br/><br/>
                        This auction was setup to support Jayden on his journey, and help him earn from his name, image and likeness. It is for entertainment purposes only. It in no way constitutes an inducement from each university's respective fans and does not constitute an explicit or implied pay for play agreement.
                        </Text>


                    </Stack>
                </Stack>

                <Modal isOpen={isOpen} size="2xl" onClose={onClose} >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Confirm Your Bid</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            You are bidding ${bidAmount} for one of {auctionData.athlete_name}'s Launch NFTs.
                            <br /><br /> <Text fontSize="xl" fontWeight="900">This bid is binding. You will not be able to cancel or receive a refund should your bid win.</Text>
                            <br />
                            We will notify winners via email with instructions on how to retrieve your NFT when the auciton ends.
                            By acknowledging this message you authorize VerifiedInk to charge your card at the end of the auction
                            for ${bidAmount} if your bid is a winning bid.

                        </ModalBody>

                        <ModalFooter>
                            <Button onClick={handleBid} w="100%" isLoading={submitting}>
                                {existingBid ? "Acknowledged" : "Acknowledged - Enter Credit Card Info"}
                            </Button>

                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </>

            :
            <>
                {meta}
                <Box align="center" pt="4">

                    <Spinner />

                </Box>
            </>

    );

}

export async function getServerSideProps(context: any) {
    const cookies = new Cookies(context.req, context.res);

    cookies.set("redirect-link", `auction/${context.query.id}`, {
        maxAge: 1000 * 60 * 60,
    });

    const nftOwnerId = await supabase.from('auction').select('*').eq('id', context.query.id).maybeSingle()

    const nftId = await supabase.from('nft_owner').select('nft_id').eq('id', nftOwnerId.data.items[0]).maybeSingle()

    const preview_url = await getScreenshot(nftId.data.nft_id);

    return {
        props: {
            publicUrl: preview_url.publicUrl,
            headline: nftOwnerId.data.headline,
            nft_id: nftId.data.nft_id,
        }
    };
}

export default Auction