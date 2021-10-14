import Card from "@/components/NftCard/Card";
import { useRouter } from "next/router";
import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  // background: white !important;
  margin: 0 !important;
  padding: 0 !important;
`;

const Screenshot = () => {
  const router = useRouter();
  const { id } = router.query;
  let int_id = parseInt(id as string);
  return (
    <Wrapper>
      {int_id && (
        <Card nft_id={int_id} nft_width={600} reverse={false} readOnly={true} />
      )}
    </Wrapper>
  );
};

export default Screenshot;
