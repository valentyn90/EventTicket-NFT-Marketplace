import { useRouter } from "next/router";
import React, { useEffect } from "react";
import styled from "styled-components";
import { QRCode } from 'react-qrcode-logo';

const Wrapper = styled.div`
  // background: white !important;
  margin: 0 !important;
  padding: 0 !important;
  position: relative;
  width: 545.81px;
  height: 900px;

  #react-qrcode-logo {
    position: absolute;
    top: 420px;
    left: 200px;
    opacity: 0.75;
  }

  .target {
    position: absolute;
    height: 900px;
  }

  .text{
    position: absolute;
    top: 546px;
    left: 240px;
    opacity: 0.5;
  }
  .id{
    position: absolute;
    top: 770px;
    left: 380px;
    opacity: 0.7;
    transform-origin: top left;
    transform: rotate(-40deg);
  }

`;

const Screenshot: React.FC = () => {
  useEffect(() => {
    document.body.classList.add("no-background");

    return () => {
      document.body.classList.remove("no-background");
    };
  }, []);
  const router = useRouter();
  const { id } = router.query;
  
  return (

    <Wrapper id="card">
      <img className="target" src="/ar/source/target-front.png"></img>
      <QRCode size={120} bgColor="transparent" fgColor="white" value={`https://verifiedink.us/ar?ar_id=${id}`} qrStyle="dots"/>
      <text className="text">Scan Me</text>
      <text className="id">No. {id}</text>
    </Wrapper>
  );
};

export default Screenshot;
