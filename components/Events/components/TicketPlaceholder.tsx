// react component that renders a video according to the tier type of the ticket.
import { Box } from "@chakra-ui/react";
import { eventTabs } from "../utils/tier";


//
const TicketPlaceholder = ({tier} : {tier: number}) => {

    const tierType = eventTabs.find((tab) => tab.id === tier);


    return (
        <Box>
            
                {tierType?.front_video ? 
                <video width="100%" autoPlay loop muted playsInline placeholder={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/static/ticket_tiers/${tier}/${tier}.png`}>
                    {/* Hardcoded above */}
                    <source
                        src={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/static/ticket_tiers/${tier}/${tier}.mp4`}
                        type='video/mp4; codecs="hvc1"'
                    />
                    <source
                        src={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/static/ticket_tiers/${tier}/${tier}.webm`}
                        type="video/webm"
                    />
                </video> :
                <img src={`https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/static/ticket_tiers/${tier}/${tier}.png`} alt="Ticket" width="100%" height="100%" />
}
            
        </Box>
    )


}

export default TicketPlaceholder;
