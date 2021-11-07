import { Box, Stack, StackDivider, useColorMode } from '@chakra-ui/react'
import { Flex, HStack, Text, TextProps } from '@chakra-ui/layout'

import React from 'react'
import ViLogo from '../ui/logos/ViLogo'
import { LinkGrid }  from './LinkGrid'
import Link from 'next/link'

export const Footer: React.FC = (props) => {
    const { colorMode } = useColorMode();

    return (<Box as="footer" role="contentinfo" mx="auto" maxW="7xl" py="12" px={{ base: '4', md: '8' }}
    >
        <Stack spacing="4" divider={<StackDivider />} >
            <Stack direction={{ base: 'column', lg: 'row' }} spacing={{ base: '10', lg: '28' }} >
                <Box flex="1">
                    <Link href="/">
                        <a>
                            <HStack height="100%">
                                <ViLogo width="25px" height="25px" />
                                <Flex align="center">
                                    <Text
                                        color={colorMode === 'light' ? 'blue' : 'white'}
                                        textTransform="uppercase"
                                        fontWeight="semibold"
                                        fontSize="2xl"
                                        ml={2}
                                    >
                                        Verified
                                    </Text>
                                    <Text
                                        marginTop="unset"
                                        fontWeight="light"
                                        alignSelf="flex-start"
                                        textTransform="uppercase"
                                        fontSize="2xl"
                                    >
                                        Ink
                                    </Text>
                                </Flex>
                            </HStack>
                        </a>
                    </Link>
                </Box>
                <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: '10', md: '20' }}>
                    <LinkGrid />
                </Stack>
            </Stack>
            <Stack
                direction={{ base: 'column-reverse', md: 'row' }}
                justifyContent="space-between"
                alignItems="center"
            >
                <Text fontSize="xs">
                    &copy; {new Date().getFullYear()} Verified Ink, LLC. All rights reserved.
                </Text>
            </Stack>
        </Stack>
    </Box>
    )
}

export default Footer