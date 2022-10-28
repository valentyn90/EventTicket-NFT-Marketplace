import { VStack, Heading, HStack, Text, Image, Box, Button, useInterval, useToast, Spacer, Divider, Input } from "@chakra-ui/react"
import userStore from "@/mobx/UserStore"
import Card from "@/components/NftCard/Card"
import { useEffect, useState } from "react"
import * as ga from "@/utils/ga";
import mixpanel from 'mixpanel-browser';
import router from "next/router";
import validateEmail from "@/utils/validateEmail";

const Completed = () => {


    const [oneSelected, setOneSelected] = useState(true)
    const [ship, setShip] = useState(true)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [emailInvalid, setEmailInvalid] = useState(true)

    const toast = useToast()

    const ulStyle = {
        listStylePosition: 'outside',
    };

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

        const stripeRes = await fetch(`/api/marketplace/giftCheckout`, {
            method: "POST",
            headers: new Headers({ "Content-Type": "application/json" }),
            credentials: "same-origin",
            body: JSON.stringify({
                email: email,
                quantity: oneSelected ? 1 : 5,
                ship: ship
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
                <Heading>AR Card Checkout</Heading>
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

                <Text>VerifiedInk AR Cards are the perfect gift for your athlete or any of their fans.</Text>

                <Heading size="md">Choose between</Heading>
                <VStack spacing={4} pb={4}>
                    <HStack justifyContent="space-evenly" border="2px" filter={oneSelected ? "none" : "grayscale(1)"} borderColor={oneSelected ? 'blue.200' : 'gray'} borderRadius={5} p={4} w="300px" onClick={() => setOneSelected(true)}>
                        <Heading size="xl">1</Heading>
                        <VStack spacing="0px">    
                        <Text fontSize="xl">$19.99</Text>
                        <Text fontSize="l" textDecoration="line-through">$29.99</Text>
                        </VStack>
                        <Image src="/ar/target/target-back.png" h="60px"></Image>

                    </HStack>
                    <HStack justifyContent="space-evenly" border="2px" filter={oneSelected ? "grayscale(1)" : "none"} borderColor={oneSelected ? 'gray' : 'blue.200'} borderRadius={5} p={4} w="300px" onClick={() => setOneSelected(false)}>
                        <Heading size="xl">5</Heading>
                        <Text fontSize="xl">$59</Text>
                        <Image src="/ar/target/5-ar-cards.png" h="60px" filter="drop-shadow( 0 0 20px white);"></Image>

                    </HStack>

                </VStack>

                <VStack>
                    <Heading size="md">Shipping</Heading>
                    <HStack>
                                                
                        <Box w="50%" minH="90px" lineHeight={"85px"} borderRadius={5} border="2px" borderColor={ship ? 'blue.200' : 'gray'} onClick={() => setShip(true)}> Ship to Me </Box>
                        <Box w="50%" minH="90px" borderRadius={5} padding={4} border="2px" borderColor={ship ? 'gray' : 'blue.200'} onClick={() => setShip(false)}> Ship to Recipient </Box>
                    </HStack>
                </VStack>

                
                <VStack pt={8} spacing={0}>
                                
                                    <Input
                                        maxW={"400px"}
                                        mb={4}
                                        autoFocus
                                        isDisabled={loading}
                                        placeholder="Email@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        borderColor={emailInvalid ? "red" : "blue.200"}
                                    />
                                    
                          


                <Button w={["80%", "200px"]} bgColor="blue.200" disabled={emailInvalid} isLoading={loading} onClick={handlePurchase}>Buy Now ${oneSelected ? "19.99" : "59"}</Button>
                </VStack>
                <VStack p={4}>
                    <Heading size={"md"} textAlign="center">Includes</Heading>
                    {oneSelected ?
                        <Box px={6}>
                            <ul>
                                <li>1 Physical Augmented Reality Card</li>
                                <li>10 VerfiedInk Digital Trading Cards</li>
                            </ul>
                        </Box> :
                        <Box px={6}>
                            <ul>
                                <li>5 Physical Augmented Reality Cards</li>
                                <li>10 VerfiedInk Digital Trading Cards</li>
                            </ul>
                        </Box>
                    }

                    <Heading pt={4} size={"md"} textAlign="center">How does it work?</Heading>

                    <Box p={4} maxW={600}>
                    If you elect to receive your cards, we'll ship your AR card(s) to your provided address. You can then gift them and the recipient can 
                    make their collectible by scanning the QR code on the AR card.
                    <br></br><br></br> 
                    If you want us to ship directly to your recipient, we'll give you a link to share with your athlete.
                    <br></br><br></br>                  
                    We think these AR cards are the best way to share your VerifiedInk with your friends, teammates and family.
                    </Box>
                </VStack>

                

            </VStack>

        </Box>)
}

export default Completed