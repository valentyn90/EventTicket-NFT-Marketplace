import { Box, SimpleGrid, SimpleGridProps, Stack } from '@chakra-ui/react'
import * as React from 'react'
import Link from 'next/link'
import { FooterHeading } from './FooterHeading'

export const LinkGrid = (props: SimpleGridProps) => (
  <SimpleGrid columns={2} {...props}>
    <Box minW="130px">
      <FooterHeading mb="4">Product</FooterHeading>
      <Stack>
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