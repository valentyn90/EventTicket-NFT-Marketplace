import React, { Component } from 'react';
import { Box, Heading, useColorModeValue, Text } from "@chakra-ui/react"
import Faq from 'react-faq-component';
import { PrivacyWrapper } from '../utils/legalStyles';

const data = {
  
  rows: [
    {
      title: "What is a VerifiedInk?",
      content: "Every high school athlete’s first digital collectable. The ultimate rookie card created by \
      the athlete themselves. With only ten first edition cards (known as Inks) for each athlete, the sky is the limit for \
      the value of Inks minted by future stars and celebrities inside and outside of sports."
    },
    {
      title: "How does this work?",
      content: "High school athletes create a VerifiedInk. They can sell them and keep the money. Each \
      athlete also continues to make money on their Ink every time it is sold, they own their legacy forever."
    },
    {
      title: "What does it cost?",
      content: "Nothing. High School athletes can create a VerifiedInk for free."
    },
    {
      title: "What is the commission on each sale?",
      content: "There is a 10% commission on each sale, 6% goes to us and 94% goes to the athlete on the \
      first sale (4% on each subsequent sale). Athletes own a piece of their Ink forever, even if they sell it."
    },
    {
      title: "How can I expand my VerifiedInk collection?",
      content: "The best way right now is to refer five friends using your referral code and have them \
      each refer five friends. You will get one copy of every Ink up to a total of 30."
    },
    {
      title: "When will I be able to trade and sell my VerifiedInk?",
      content: "We are building a large enough number of VerifiedInks to support a robust <a style='font-weight:bold' href='/marketplace'>marketplace</a>. \
      We expect to launch the live marketplace in early 2022."
    },
    {
      title: "Can I make more than 10 VerifiedInks?",
      content: "Once our <a style='font-weight:bold' href='/marketplace'>marketplace</a> opens, if you sell one or more of your existing VerifiedInks we \
      will produce a second edition batch of 50 more VerifiedInks."
    },
    {
      title: "Why does my collection say that I only have seven VerifiedInks?",
      content: "We reserve three of your original Inks. One goes to the person that referred you, one goes to \
      the person that referred them, and one goes to our collective pool. You keep the other seven. Get more \
      Inks by referring up to five people using your referral code and having each of them refer five people."
    }
  ]
}

const Faqs: React.FC = () => {

    return(
      <Box bg={useColorModeValue("gray.50", "inherit")} as="section" py="10">
      <Box maxW={{ base: 'xl', md: '2xl', lg: '7xl' }} mx="auto" px={{ base: '6', md: '8' }}>
          <Box textAlign="center" maxW="3xl" mx="auto">
              <Heading size="2xl" fontWeight="extrabold" letterSpacing="tight" paddingBottom="10">
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