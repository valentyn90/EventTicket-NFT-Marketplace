import { Box, HStack, Icon, SimpleGrid, SimpleGridProps, Stack, useToast, Image } from '@chakra-ui/react'
import * as React from 'react'
import Link from 'next/link'
import { FooterHeading } from './FooterHeading'
import { FaInstagram, FaLinkedin, FaLinkedinIn, FaTwitter } from 'react-icons/fa'

export const LinkGrid: React.FC = (props: SimpleGridProps) => {

    const toast = useToast();

    async function handleClick() {
        toast({
            position: "top",
            description: "Coming Soon",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    }

    return (
        <SimpleGrid columns={3} spacing={{ base: '10', md: '20', lg: '28' }} flex="1" {...props}>
            <Box>
                <FooterHeading mb="4">Press</FooterHeading>
                <Stack spacing="4" color="subtle">
                    <Link href={"https://www.espn.com/nfl/story/_/id/34209083/mac-jones-leading-marketplace-naasir-cunningham-video-trading-cards-nhl-new-partnership"}>
                    <Image src="/img/espn.png" alt="espn" w="60px"/>
                    </Link>
                    <Link href={"https://usatodayhss.com/2022/new-platform-allows-high-school-athletes-to-design-sell-nft-trading-cards"}>
                    <Image src="/img/usatoday.png" alt="espn" w="80px"/>
                    </Link>
                 
                </Stack>
            </Box>
            <Box minW="100px">
                <FooterHeading mb="4">Product</FooterHeading>
                <Stack>
                    {/* <a onClick={handleClick}>FAQ</a> */}
                    <Link href="/team">Team</Link>
                    <Link href="/faq">FAQ</Link>
                    <Link href="mailto:support@verifiedink.us">Help</Link>

                </Stack>
            </Box>
            <Box minW="100px">
                <FooterHeading mb="4">Legal</FooterHeading>
                <Stack>
                    <Link href="/terms">Terms</Link>
                    <Link href="/privacy">Privacy</Link>
                </Stack>
            </Box>
        </SimpleGrid>
    )
}

export default LinkGrid