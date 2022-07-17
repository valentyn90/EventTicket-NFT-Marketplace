import Card from "@/components/NftCard/Card";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { Box, HStack, Image, Text, VStack, Heading, Icon, Button, IconButton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";


interface Props { }

const Auction: React.FC<Props> = ({ }) => {


    // Show the card
    // Split screen into two halves
    // Left Side is purchase
    // Right Side is auction

    const [showBuyNow, setShowBuyNow] = useState(true);

    const [purchaseQuantity, setPurchaseQuantity] = useState(1);
    const [incrementEnabled, setIncrementEnabled] = useState(true);
    const [decrementEnabled, setDecrementEnabled] = useState(false);

    const price = 25;
    const maxQuantity = 7;


    useEffect(() => {
        if (purchaseQuantity >= maxQuantity) {
            setPurchaseQuantity(maxQuantity);
            setIncrementEnabled(false)
        } else
            if (purchaseQuantity < 1) {
                setPurchaseQuantity(1);
            } else
                if (purchaseQuantity === 1) {
                    setDecrementEnabled(false);
                } else {
                    setDecrementEnabled(true);
                    setIncrementEnabled(true);
                }

    }, [purchaseQuantity])


    //react icon minus sign in circle
    const minus = <Icon name="minus" size="2x" />;
    // const minus = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>;

    return (
        <Box py={3} align="center" alignContent={"center"}
        // bgPos="bottom"
        //         bgImage="linear-gradient(#1a202d,#1a202d,rgba(0, 0, 0, 0.1)), url('img/basketball-court.jpg')"
        //         bgSize="cover"
        //         minH={["unset", "unset", "75vh"]}
        >
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
                        <Text>$500</Text>
                        <Text color="gray">Launch Edition 1/1</Text>
                    </Box>

                </HStack>
                {showBuyNow ?
                    <VStack maxW={450}>
                        <Heading>Extended Edition</Heading>
                        <Text color="gray.400" textAlign="center" maxW="400px">Buy 1 of 500 Extended Edition NFTs. Each purchase has a chance to pull either a Rare or Legendary NFT from Naas Cunningham's Extended Edition Set.</Text>
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
                        <Button size="lg" fontSize={"xl"} minW="200px" background="blue">Buy - ${price * purchaseQuantity}</Button>
                        <Text fontStyle="italic">
                            Only {maxQuantity} left before price increases to ${price + 10}
                        </Text>
                        <Heading pt={4} as="h3" alignSelf={"start"} size="lg">NFTs In This Drop</Heading>
                        <Text textAlign={"left"}>
                            #1 recruit Naas Cunningham is releasing his first NFT with VerifiedInk. Below we've outlined the different NFTs that are available in this drop. 
                            With each purchase you will randomly receive one of these NFTs from the Extended Edition Set.
                        </Text>
                        <HStack textAlign={"start"} minWidth={350} maxW={450} justifyContent="space-between">
                            <Card readOnly={true} nft_id={1160} nft_width={150} />
                            <Box>
                                <Heading size="sm">Legendary - 15 Total</Heading>
                                <Text color="gray.400">Need Details here</Text>
                                <Text fontWeight="900" fontSize="lg">Utility</Text>
                                <li>sadf</li>
                                <li>sadf</li>
                            </Box>
                        </HStack>
                        <HStack textAlign={"start"} minWidth={350} maxW={450} justifyContent="space-between">
                            <Card readOnly={true} nft_id={1161} nft_width={150} />
                            <Box>
                                <Heading size="sm">Rare - 40 Total</Heading>
                                <Text color="gray.400">Need Details here</Text>
                                <Text fontWeight="900" fontSize="lg">Utility</Text>
                                <li>sadf</li>
                                <li>sadf</li>
                            </Box>
                        </HStack>
                        <HStack textAlign={"start"}minWidth={350} maxW={450} justifyContent="space-between">
                            <Card readOnly={true} nft_id={1162} nft_width={150} />
                            <Box>
                                <Heading size="sm">Common - 445 Total</Heading>
                                <Text color="gray.400">Need Details here</Text>
                                <Text fontWeight="900" fontSize="lg">Utility</Text>
                                <li>sadf</li>
                                <li>sadf</li>
                            </Box>
                        </HStack>
                    </VStack>
                    :
                    <VStack>

                    </VStack>
                }
            </VStack>

        </Box>
    )
}

export default Auction;