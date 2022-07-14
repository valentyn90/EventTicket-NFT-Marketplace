import { useRouter } from "next/router";
import React, { useEffect } from "react";
import styled from "styled-components";
import { QRCode } from 'react-qrcode-logo';

const Wrapper = styled.div`
  // background: white !important;
  background: #c0c0c0 !important;
  margin: 0px !important;
  padding: 40px !important;
  position: relative;
  width: 626px;
  height: 980px;

  #react-qrcode-logo {
    position: relative;
    top: 377px;
    left: 168px;
    opacity: 0.75;
    backdrop-filter: blur(12px) brightness(0.85);
  }

  .target {
    position: absolute;
    height: 900px;
  }

  .text{
    position: relative;
    top: 590px;
    left: 240px;
    opacity: 0;
  }
  .id{
    position: absolute;
    top: 813px;
    left: 416px;
    opacity: 0.7;
    transform-origin: top left;
    transform: rotate(-40deg);
    // backdrop-filter: blur(12px);
    
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
  const { id, back } = router.query;



  return (

    <Wrapper id="card">
      <img className="target" src={back ? '/ar/source/target-back.png' : '/ar/source/target-front.png'}></img>
      {back ? null :
        <QRCode size={200} bgColor="transparent" fgColor="white" value={`https://verifiedink.us/ar?ar_id=${id}`} qrStyle="dots" />
      }
      <text className="text">Scan Me</text>
      {back ? null : <text className="id">No. {id}</text>}
            
    </Wrapper>
  );
};

export default Screenshot;
