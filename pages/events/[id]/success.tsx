import EventPaymentConfirmation from "@/components/Events/views/[id]/EventPaymentConfirmation"
import { supabase } from "@/supabase/supabase-client"
import { getUserDetailsByEmail } from "@/supabase/userDetails"
import { Heading, Text, Box, Center, HStack, Image, VStack } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { useEffect } from "react"

import { eventTabs } from "@/components/Events/utils/tier"

const Success = () => {

    const router = useRouter()
    const { id, email, order_id } = router.query

    const { isLoading, isError, data: tickets, error } = useQuery(
        ['tickets'], async () => {
            const owner_id = await getUserDetailsByEmail(email as string)

            const { data: tickets, error } = await supabase.from("event_ticket_owner")
                .select(`*, event_order_ticket!inner( order_id)`)
                .eq('event_id', id)
                .eq('event_order_ticket.order_id', order_id)
                .eq('owner_id', owner_id.data.user_id)     
           
                console.log(tickets)          


            const ticketsWithTier = tickets!.map((ticket: any) => {
                const tier = eventTabs.find((tab) => tab.id === ticket.tier_id)
                return { ...ticket, tier }
            })

            return ticketsWithTier
        },
        { enabled: (!!id && !!email) })

    useEffect(() => {
      
    
      
    }, [tickets])
    


    return (
        // <EventPaymentConfirmation></EventPaymentConfirmation>
        <Center>
            <Box p={4} maxW="600px">

                <Heading>Your tickets have been purchased!</Heading>


                <Text mt={8}>Your Order:</Text>
                {tickets?.map((ticket) => {
                    return(
                <HStack mt={2} border="1px" borderColor="#0D9DE5" borderRadius="5px">
                    <Image src="/img/ticket/ticket.png" h="150px" px="10px" />
                    <VStack alignItems="flex-start" gridGap={"2.5"}>
                        <Text>{ticket.tier.name || 'TBD'} - ${ticket.tier.price || 'N/A'}</Text>
                        <HStack>
                            <HStack>
                                <Text>Section</Text>
                                <Text>{ticket.section || 'TBD'}</Text>
                            </HStack>
                            <HStack>
                                <Text>Row</Text>
                                <Text>{ticket.row || 'TBD'}</Text>
                            </HStack>
                            <HStack>
                                <Text>Seat</Text>
                                <Text>{ticket.seat || 'TBD'} </Text>
                            </HStack>
                        </HStack>
                        <Text>Tap to view ticket {ticket.ticket_id}</Text>

                    </VStack>
                </HStack>
                    )
                })}


            </Box>
        </Center>
    )

}

export default Success