import Card from "@/components/NftCard/Card";
import Nft from "@/types/Nft";
import { getFileLinkFromSupabase, getNftById } from "@/utils/supabase-client";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";

interface Props {
  data: Nft | null;
  publicUrl: string | undefined;
}

const CardId: React.FC<Props> = ({ data, publicUrl }) => {
  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      px={{ base: "4", lg: "8" }}
    >
      {data && (
        <Card
          nft_id={data.id}
          db_first_name={data.first_name}
          public_url={publicUrl}
          nft_width={600}
          reverse={false}
          readOnly={true}
        />
      )}
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as any;

  let int_id = parseInt(id as string);

  const { data, error } = await getNftById(int_id);

  const { publicUrl, error: error2 } = await getFileLinkFromSupabase(data.screenshot_file_id);



  if (data) {
    if (publicUrl) {
      return {
        props: {
          data, publicUrl
        },
      };
    }
    else {
      return {
        props: {
          data
        }
      }
    }
  } else {
    return {
      props: {
        data: null,
      },
    };
  }
};

export default CardId;
