import Card from "@/components/NftCard/Card";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
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
  const { id, serial_no } = router.query;
  let int_id = parseInt(id as string);
  let serial_int = serial_no === undefined ? 1 : parseInt(serial_no as string);

  return (

    <Wrapper>
      {!int_id ? (
        <div></div>
      ) : (
        <Card nft_id={int_id} serial_no={serial_int} nft_width={600} reverse={false} readOnly={true} noGlow={true} />
      )}
    </Wrapper>
  );
};

export default Screenshot;
