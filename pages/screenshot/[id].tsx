import Card from "@/components/NftCard/Card";
import VerifiedInkNft from "@/components/VerifiedInkNft/VerifiedInkNft";
import StaticVerifiedInkNft from "@/components/VerifiedInkNft/StaticVerifiedInkNft";
import { supabase } from "@/supabase/supabase-client";
import { Box, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { AiFillSafetyCertificate } from "react-icons/ai";
import styled from "styled-components";

const Wrapper = styled.div`
  // background: white !important;
  margin: 0 !important;
  padding: 0 !important;
`;

const Screenshot: React.FC = () => {
  useEffect(() => {
    document.body.classList.add("no-background");

    return () => {
      document.body.classList.remove("no-background");
    };
  }, []);
  const router = useRouter();
  const { id, serial_no, video } = router.query;
  let int_id = parseInt(id as string);
  let serial_int = serial_no === undefined ? 1 : parseInt(serial_no as string);
  const [year, setYear] = React.useState(2021);

  useEffect(() => {
    const fetchData = async() => {
      const {data, error} = await supabase.from('nft').select('*').eq('id', int_id).single()
      
      setYear(data?.vfd_year)
      // setYear(2023)
      
    }
    if(router){
      fetchData()
    }
  }, [router]);

  return (

    video ? 
      <Wrapper>
        <VStack pt={40}>
          <Card nft_id={int_id} serial_no={serial_int} nft_width={200} reverse={false} readOnly={true} noGlow={true} />
        </VStack>
      </Wrapper>

      :

    <Wrapper>
      {!int_id ? (
        <div></div>
      ) : 
      
      year === 2022 ?

      (
        <Card nft_id={int_id} serial_no={serial_int} nft_width={600} reverse={false} readOnly={true} noGlow={true} />
      )
      :
      (
        <StaticVerifiedInkNft nftId={int_id} nftWidth={544} readOnly={true} />
      )

      }
    </Wrapper>

      
  );
};

export default Screenshot;
