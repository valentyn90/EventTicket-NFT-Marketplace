import StaticCard from "@/components/NftCard/StaticCard";
import { addEmailToWaitlist, getScreenshot } from "@/supabase/supabase-client";
import { Box, Heading, Stack, Text, VStack, Input, Button, Image, Spacer, HStack, useToast, Divider } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import validateEmail from "@/utils/validateEmail";
import ShareButton from "@/components/Components/ShareButton";
import Head from "next/head";

interface Props {
    publicUrl?: string
}

const Naas: React.FC<Props> = ({ publicUrl }) => {

    const [reverse, setReverse] = useState(false);
    const [flipCount, setFlipCount] = useState(0);
    const [email, setEmail] = useState("");
    const [validEmail, setValidEmail] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [loading, setLoading] = useState(false);

    const toast = useToast()

    useEffect(() => {
        if (flipCount == 0) {
            setTimeout(() => {
                setFlipCount(flipCount + 1);
                setReverse(!reverse);
            }, 3000)
        }
        if (flipCount == 1) {
            setTimeout(() => {
                setFlipCount(flipCount + 1);
                setReverse(!reverse);
            }, 15000)
        }
    }, [flipCount, reverse])


    async function validateEmailForm(e: any) {
        setEmail(e.target.value)
        const valid = validateEmail(e.target.value);
        setValidEmail(valid);
    }

    async function handleEmail(e: any) {
        setLoading(true);
        if (!validEmail) {
            toast({
                position: "top",
                status: "error",
                description: "Please enter a valid email.",
                duration: 3000,
                isClosable: true,
            });
            setLoading(false);
            return null;
        }

        const { data: data, error: error } = await addEmailToWaitlist(email, "naas");
        if (error) {

            toast({
                position: "top",
                status: "error",
                description: error.message,
                duration: 3000,
                isClosable: true,
            });
        } else {
            setRegistered(true)
            toast({
                position: "top",
                description: `Thank you for signing up.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        }
        setLoading(false);
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
                content={publicUrl}
            />
            <meta
                property="twitter:image"
                key="twitter-image"
                content={`https://verifiedink.us/api/meta/showTwitterPreview/763`}
            />
        </Head>
    )

    return (
        <>
            
            <Box bgPos="bottom"
                bgImage="linear-gradient(#1a202d,#1a202d,rgba(0, 0, 0, 0.75)), url('img/basketball-court.png')"
                bgSize="cover"
                minH={["unset", "unset", "75vh"]}
                pt={["unset", "unset", "30px"]}

            >
                <HStack margin="auto" align="center" justifyContent="center" gridGap={6}>
                    <Box  align="center" display={["none", "none", "block"]} pb="5">
                        <StaticCard nft_id={763} reverse={reverse}></StaticCard>
                    </Box>
                    <VStack mt={2} p={4} margin="auto" maxW="488px" align="center">

                        <Box ml="1" mt={2} w="fit-content" boxShadow="0 0 100px red" paddingInline={3} paddingBlock={1} bg="red" transform={"auto"} skewX={"-5"} skewY={"-5"}><Heading fontWeight={"bold"} fontSize={"md"}>#1 IS COMING</Heading></Box>
                        <Heading zIndex={2}>Naas Cunningham</Heading>
                        <Text textAlign={"center"} pb="5">
                            Starting July 19th you can participate in consensus #1 class of '24 recruit Nassir Cunningham's first NFT drop.
                        </Text>
                        <Box align="center" display={["block", "block", "none"]} pb="5"
                            
                        >
                            <StaticCard nft_id={763} width={350} reverse={reverse}></StaticCard>
                        </Box>
                        {/* <Box h={["50px","50px","100px"]}></Box> */}
                        <VStack backdropFilter="blur(5px)" border="1px" borderRadius="md" borderColor="#71c3ff73" p="3">
                            {!registered ?
                                <>
                                    <Text fontWeight="black" color="#71c3ff"  backgroundColor="#1a202d" pos="relative" top="-25px" align={"center"} paddingInline="2">SIGN UP</Text>
                                    <Heading textAlign={"center"}>Be the first to know</Heading>
                                    <Text textAlign={"center"} color="GrayText">Sign up for alerts for when the sale goes live, and don't miss out on a chance to win alongside the next basketball superstar.</Text>

                                    <Input border="0" value={email} onChange={validateEmailForm} backgroundColor="#0d162b" placeholder="Your email address" _placeholder={{ color: "gray" }} />
                                    <Button onClick={handleEmail} disabled={!validEmail} isLoading={loading} p="5" backgroundColor={"#0067ff"}>SUBMIT</Button>
                                </>
                                :
                                <>
                                    <Heading textAlign={"center"}>We've got you on the List!</Heading>
                                    <Text textAlign={"center"} color="GrayText">As we get closer to Naas' drop, we'll keep you updated on timing and price at:</Text>
                                    <Text textAlign={"center"} color="GrayText">{email}</Text>
                                    <Divider borderColor="gray" />
                                    <Text textAlign={"center"}>Share this page with your friends to invite them to the future of fandom.</Text>
                                    <ShareButton buttonText="Share" url="https://verifiedink.us/naas" share_text="👀 The #1 Hoops Recruit from the class of 24 is dropping his first NFT on July 19th. Check it out here." title="Naas Cunningham Rookie NFT"></ShareButton>
                                </>
                            }
                        </VStack>

                        <Box h="200px"></Box>

                    </VStack>
                </HStack>
            </Box>
            {meta}
        </>



    )
};

export async function getServerSideProps(context: any) {

    const preview_url = await getScreenshot(763)
    return {
        props: {
            publicUrl: preview_url.publicUrl,
        }
    }
}

export default Naas;