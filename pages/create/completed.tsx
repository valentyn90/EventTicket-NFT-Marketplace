import { VStack, Heading, HStack, Text, Image, Box, Button, useInterval, useToast, Spacer, Divider } from "@chakra-ui/react"
import userStore from "@/mobx/UserStore"
import Card from "@/components/NftCard/Card"
import { useState } from "react"
import * as ga from "@/utils/ga";
import mixpanel from 'mixpanel-browser';
import router from "next/router";

const Completed = () => {


    const [oneSelected, setOneSelected] = useState(true)
    const [loading, setLoading] = useState(false)

    const toast = useToast()

    const ulStyle = {
        listStylePosition: 'outside',
    };

    async function handlePurchase(e: any) {
        e.preventDefault()
        setLoading(true)
        ga.event({
            action: "conversion",
            params: {
                send_to: 'AW-10929860785/qCYvCMDx6dMDELHh4dso',
                value: oneSelected ? 19.99 : 59,
                currency: 'USD'
            },
        });

        mixpanel.track("AR Card - Check Out", { purchaseQuantity: oneSelected ? 1 : 5, total_spend: oneSelected ? 19.99 : 59 });

        const stripeRes = await fetch(`/api/marketplace/arCheckout`, {
            method: "POST",
            headers: new Headers({ "Content-Type": "application/json" }),
            credentials: "same-origin",
            body: JSON.stringify({
                email: userStore.email.toLowerCase(),
                user_id: userStore.id,
                quantity: oneSelected ? 1 : 5,
                nft_id: userStore.nft?.id,
            }),
        })
            .then((res) => res.json())
            .then(async (data) => {
                if (data.sessionUrl) {
                    window.location.assign(data.sessionUrl);
                }
                // Handle Rejection / Errors
                if (data.status) {
                    setLoading(false)
                    if (data.status === "success") {
                        toast({
                            position: "top",
                            description: data.message,
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                        });
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
    }

    return (
        <Box
            bgImage={"linear-gradient(to bottom, rgba(0, 0, 0, 0.3),rgba(0, 0, 0, 0.3)), url('/img/basketball-court.jpg')"}
            bgSize="cover"
            bgColor={'#000'}
            align="center"
        >
            <VStack pt={3} backdropFilter={"blur(4px)"} >
                <Heading>Hold Your VerifiedInk IRL</Heading>
                <HStack >
                    {/* <Card nft_id={userStore.nft?.id} nft_width={150} /> */}
                    <video width="300" autoPlay loop muted playsInline>
                        <source
                            src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-safari.mp4"
                            type='video/mp4; codecs="hvc1"' />
                        <source
                            src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-vp9-chrome.webm"
                            type="video/webm" />
                    </video>
                </HStack>

                <Text>You've made your Ink, now show it off in real life.</Text>

                <Heading size="md">Choose between</Heading>
                <VStack spacing={4} pb={4}>
                    <HStack justifyContent="space-evenly" border="2px" filter={oneSelected ? "none" : "grayscale(1)"} borderColor={oneSelected ? 'blue.200' : 'gray'} borderRadius={5} p={4} w="300px" onClick={() => setOneSelected(true)}>
                        <Heading size="xl">1</Heading>
                        <Text fontSize="xl">$19.99</Text>

                        <Image src="/ar/target/target-back.png" h="60px"></Image>

                    </HStack>
                    <HStack justifyContent="space-evenly" border="2px" filter={oneSelected ? "grayscale(1)" : "none"} borderColor={oneSelected ? 'gray' : 'blue.200'} borderRadius={5} p={4} w="300px" onClick={() => setOneSelected(false)}>
                        <Heading size="xl">5</Heading>
                        <Text fontSize="xl">$59</Text>
                        <Image src="/ar/target/5-ar-cards.png" h="60px" filter="drop-shadow( 0 0 20px white);"></Image>

                    </HStack>

                </VStack>
                <Button w={["80%", "200px"]} bgColor="blue.200" disabled={userStore.id ? false : true} isLoading={loading} onClick={handlePurchase}>Buy Now ${oneSelected ? "19.99" : "59"}</Button>
                <VStack p={4}>
                    <Heading size={"md"} textAlign="center">Includes</Heading>
                    {oneSelected ?
                        <Text px={6}>
                            <ul>
                                <li>1 Physical Augmented Reality Card</li>
                                <li>10 VerfiedInk Digital Trading Cards</li>
                            </ul>
                        </Text> :
                        <Text px={6}>
                            <ul>
                                <li>5 Physical Augmented Reality Cards</li>
                                <li>10 VerfiedInk Digital Trading Cards</li>
                            </ul>
                        </Text>
                    }

                    <Heading pt={4} size={"md"} textAlign="center">How does it work?</Heading>

                    <Box p={4} maxW={600}>
                    We'll ship your AR cards to your provided address. Once you receive them, simply scan the card with your phone camera 
                    and you'll see your VerifiedInk in Augmented Reality through your phone. Flip the card over and your video will start playing.
                    <br></br><br></br>                  
                    We think these AR cards are the best way to share your VerifiedInk with your friends, teammates and family.
                    </Box>

                   <Divider pt={6}/>
                   <Spacer p={4}/>
                    <Button w={["80%", "200px"]} isLoading={loading} onClick={()=>{setLoading(true); router.push('/create/step-8')}}>No Thanks</Button>
                    <Spacer p={4}/>
                </VStack>

                

            </VStack>

        </Box>)
}

export default Completed