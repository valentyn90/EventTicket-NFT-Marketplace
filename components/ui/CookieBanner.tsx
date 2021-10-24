import { Button, HStack, Link, StackProps, Text } from '@chakra-ui/react'
import * as React from 'react'
import { useEffect, useState } from 'react'

export const CookieBanner = (props: StackProps): JSX.Element | null => {

    const [visible, setVisible] = useState<boolean>(false)

    const handleAcceptance = () => {
        localStorage.setItem('DFX-cookie-banner', 'visible')
        setVisible(false)
    }

    useEffect(() => {
        const hasSeenCookie = localStorage.getItem('DFX-cookie-banner')
        if (!hasSeenCookie) {
            setVisible(true)
        }
    }, [])
    if (!visible) {
        return null
    }

    return (
        <HStack justify="center" spacing="4" p="4" bg="gray.700" sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0
        }} {...props}>
            <Text color="white" fontSize={{ base: 'sm', md: 'md' }}>
                By using our website, you agree to the use of cookies as described in our{' '}
                <Link href="#" textDecoration="underline">
                    cookie policy
                </Link>
            </Text>
            <Button onClick={handleAcceptance} bg="white" color="black" _hover={{ bg: 'gray.100' }} size="sm" flexShrink={0}>
                Accept
            </Button>
        </HStack>)

}