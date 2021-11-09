import React, { Component } from 'react';
import { Box, Heading, useColorModeValue, Text } from "@chakra-ui/react"
import Faq from 'react-faq-component';
import { PrivacyWrapper } from '../utils/legalStyles';

const data = {
  
  rows: [
    {
      title: "What is a Verified Ink?",
      content: "A verified ink is a limited run NFT created by High School athletes."
    },
    {
      title: "How many Inks are minted (created) per Athlete?",
      content: "Each mint consists of 10 Inks. 7 Inks go directly to the athlete's collection. 3 Inks are reserved for VerifiedInk and are used for referral rewards."
    },
    {
      title: "How much does it cost to make a Verified Ink?",
      content: "Creating a Verified Ink is free."
    },
    {
      title: "What is a royalty? Do Verified Inks pay royalties?",
      content: "Royalties are payments for secondary sales of any item. Verified Ink's have Royalties built into the NFT. " +
      "Athletes will receive 6% of every sale of their Ink in perpetuity. Of course, you'll receive 100% of the first sale."
    }]
}

const Faqs: React.FC = () => {

    return(
      <Box bg={useColorModeValue("gray.50", "inherit")} as="section" py="10">
      <Box maxW={{ base: 'xl', md: '2xl', lg: '7xl' }} mx="auto" px={{ base: '6', md: '8' }}>
          <Box textAlign="center" maxW="3xl" mx="auto">
              <Heading size="2xl" fontWeight="extrabold" letterSpacing="tight">
                  FAQS
              </Heading>
              <PrivacyWrapper>
              <Faq data={data}
                  styles={{
                    arrowColor:"white"
          
                }} 
              />
              </PrivacyWrapper>
          </Box>

      </Box>
  </Box>
    )
}

export default Faqs