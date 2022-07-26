import {
    Checkbox,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Input,
    Spacer,
    Stack,
    useColorModeValue,
} from '@chakra-ui/react'
import * as React from 'react'
import { useState } from 'react'

export const ShippingInformation = () => {

    const [phone, setPhone] = useState("")

    async function validatePhone(e: any) {

        let phone_no = e.target.value.replace(/[^0-9]/g, '');
        const len = phone_no.length;
        if (len < 4) {
        } else
            if (len >= 4 && len < 7) {
                phone_no = `(${phone_no.slice(0, 3)}) ${phone_no.slice(3)}`;
            } else {
                phone_no = `(${phone_no.slice(0, 3)}) ${phone_no.slice(3, 6)} - ${phone_no.slice(6, 10)}`;
            }
        setPhone(phone_no)
    }

    return (
        <Stack spacing={{ base: '6', md: '10' }}>
            <Heading size="md">Shipping Information</Heading>
            <Stack spacing={{ base: '6', md: '8' }}>
                <FormControl id="name">
                    <FormLabel color={useColorModeValue('gray.700', 'gray.200')}>Full name</FormLabel>
                    <Input
                        name="name"
                        placeholder="Your first and last name"
                        focusBorderColor={useColorModeValue('blue.500', 'blue.200')}
                    />
                </FormControl>
                <FormControl id="street">
                    <FormLabel color={useColorModeValue('gray.700', 'gray.200')}>Street address</FormLabel>
                    <Input
                        name="street_1"
                        id="street_1"
                        placeholder="123 Example Street"
                        focusBorderColor={useColorModeValue('blue.500', 'blue.200')}
                    />
                    <Spacer p="1" />
                    <Input
                        name="street_2"
                        id="street_2"
                        placeholder="Apt #123"
                        focusBorderColor={useColorModeValue('blue.500', 'blue.200')}
                    />
                </FormControl>

                <HStack spacing="6">
                    <FormControl id="zip" maxW="32">
                        <FormLabel color={useColorModeValue('gray.700', 'gray.200')}>Zip Code</FormLabel>
                        <Input
                            name="zip"
                            placeholder="Zip Code"
                            maxLength={5}
                            focusBorderColor={useColorModeValue('blue.500', 'blue.200')}
                        />
                    </FormControl>
                    <FormControl id="city">
                        <FormLabel color={useColorModeValue('gray.700', 'gray.200')}>City</FormLabel>
                        <Input
                            name="city"
                            placeholder="City"
                            focusBorderColor={useColorModeValue('blue.500', 'blue.200')}
                        />
                    </FormControl>
                    <FormControl id="state" maxW="20">
                        <FormLabel color={useColorModeValue('gray.700', 'gray.200')}>State</FormLabel>
                        <Input
                            name="state"
                            placeholder="NY"
                            maxLength={2}
                            focusBorderColor={useColorModeValue('blue.500', 'blue.200')}
                        />
                    </FormControl>
                </HStack>
                <FormControl id="phone">
                    <FormLabel color={useColorModeValue('gray.700', 'gray.200')}>Phone</FormLabel>
                    <Input
                        name="phone"
                        type='tel'
                        value={phone}
                        onChange={validatePhone}
                        placeholder="(123) 456-7890"
                        focusBorderColor={useColorModeValue('blue.500', 'blue.200')}
                    />
                </FormControl>
            </Stack>
        </Stack>

    )
}