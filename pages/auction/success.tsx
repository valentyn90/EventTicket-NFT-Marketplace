import ShareButton from "@/components/Components/ShareButton";
import { supabase } from "@/supabase/supabase-client";
import { Button, Heading, HStack, Stack, Text, VStack } from "@chakra-ui/react"
import { NextApiRequest, NextApiResponse } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Cookies from "cookies";
import Link from "next/link";

const Success: React.FC = () => {

    const router = useRouter();
    const [auctionId, setAuctionId] = useState<any>();
    const [teamId, setTeamId] = useState<any>();
    const [teamName, setTeamName] = useState<any>();
    const [submitting, setSubmitting] = useState(false);

    // pull bid
    // get link to auction

    useEffect(() => {

        const getSchoolData = async () => {
            const { data, error } = await supabase.from("school")
                .select("*")
                .eq("id", router.query.team_id)

            if (data) {
                setTeamName(data[0].school)
            }
        }

        if (router.query.auction_id) {
            setAuctionId(router.query.auction_id as string);
            setTeamId(router.query.team_id as string);
            getSchoolData();
        }

    }, [router])



    return (
        <>
            <VStack alignItems="center" justifyContent="center" align="center" paddingInline={["6", "4", "4"]} pb={[8, 8, 0]}>
                <Heading mt="4">Successful Bid</Heading>
                <Text mt="2">You'll receive an email with confirmation of your bid.</Text>
                <Text>Share the link below with fellow {teamName} fans or sign in to increase your bid.</Text>
                <HStack pt="2" pb="2">
                    <ShareButton auction_id={auctionId} team_id={teamId}>Share</ShareButton>
                    <Link href={"/marketplace/signin"}>
                        <Button px="10" isLoading={submitting} onClick={() => setSubmitting(true)}>
                            Sign In
                        </Button>
                    </Link>
                </HStack>

                <Link href={`/auction/${auctionId}?team_id=${teamId}`}>
                        <Button isLoading={submitting} onClick={() => setSubmitting(true)}>
                            Back to Auction
                        </Button>
                    </Link>
            </VStack>
        </>
    )

}

export async function getServerSideProps(context: any) {
    const cookies = new Cookies(context.req, context.res);

    cookies.set("redirect-link", `auction/${context.query.auction_id}`, {
        maxAge: 1000 * 60 * 60,
    });

    return { props: {} };
}

export default Success