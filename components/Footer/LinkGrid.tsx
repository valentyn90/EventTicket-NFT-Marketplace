import { Box, SimpleGrid, SimpleGridProps, Stack, useToast } from '@chakra-ui/react'
import * as React from 'react'
import Link from 'next/link'
import { FooterHeading } from './FooterHeading'

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
        <SimpleGrid columns={2} spacing={{ base: '10', md: '20', lg: '28' }} flex="1" {...props}>
            <Box minW="130px">
                <FooterHeading mb="4">Product</FooterHeading>
                <Stack>
                    {/* <a onClick={handleClick}>FAQ</a> */}
                    <Link href="/faq">FAQ</Link>
                    <Link href="mailto:support@verifiedink.us">Help</Link>

                </Stack>
            </Box>
            <Box minW="130px">
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