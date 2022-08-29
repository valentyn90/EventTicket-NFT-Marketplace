import StaticCard from "@/components/NftCard/StaticCard";
import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button, HStack, Text, Skeleton, Stack, Heading, Box, VStack } from "@chakra-ui/react";
import useWindowDimensions from "@/utils/useWindowDimensions";
import mixpanel from 'mixpanel-browser';

const WordChange = keyframes`
  0% { content: "Collector" }
  20% { content: "Fan" }
  40% { content: "Friend" }
  60% { content: "Mom" }
  80% { content: "Brother" }
`;

const Wrapper = styled.div`
  /* overflow: hidden; */
  background-color: var(--chakra-colors-blueBlack);
  
  min-height: 100vh;

  .inner {
    overflow: hidden;
  }

  .bold-txt {
    font-weight: bold;
    margin-left: 6px;
  }

  .blue-txt {
    color: var(--chakra-colors-viBlue2);
  }

  .card-box {
    width: 325px;
    // height: 500px;
    opacity: 0.1;
  }

  .card-box:hover {
    opacity: 1;
  }

  .flip {
    transform: rotateY(180deg);
  }

  .card-full-opacity {
    opacity: 1;
  }
  
  .tap {
    top: -56px;
    left: 840px;
    position: absolute;
    height: 80px;
    opacity: 0.5;
  }

  .btn {
    text-align: center;
    padding: 16px;
    cursor: pointer;
    transition: all 300ms ease-out;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    font-size: 16px;
    box-shadow: 0px 4px 4px 0px #00000040;
  }

  .btn-blue {
    color: white;
    background: var(--chakra-colors-viBlue2);
  }

  .btn-white {
    background: white;
    color: var(--chakra-colors-viBlue2);
  }

  .hero {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
    margin-top: 5rem;
    display: flex;
    justify-content: space-between;
    margin-bottom: 300px;

    .hero-left {
      z-index: 5;
      // flex: 1;
      margin-right: 45%;
      backdrop-filter: blur(5px);
    }

    .hero-button-row {
      display: flex;
      justify-content: space-evenly;
    }

    .hero-button-box {
      margin-top: 5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
      width: 100%;
      text-align: center;
    }

    .hero-gradient {
      text-shadow:
          0 0 14px rgb(239 239 240),
          0 0 21px rgb(239 239 240),
          0 0 42px #3f7bfb,
          0 0 82px #3f7bfb,
          0 0 92px #3f7bfb,
          0 0 102px #3f7bfb;
    }

    .hero-subtitle {
      font-size: 1.5rem;
      width: 80%;
      text-align: center;
      margin: auto;
      margin-top: 2rem;
    }

    .hero-button-title {
      font-weight: 800;
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }

    .hero-right {
      flex: 1;
      position: absolute;
    }

    .hero-left-cards {
      display: flex;
      position: absolute;
      transform: scaleX(-1);
      transform-origin: top left;
    }

    .hero-right-cards {
      display: flex;
      position: absolute;
      margin-bottom: 60px;
    }

    .hero-card-mobile {
      display: none;
    }
  }

  .athletes-section {
    background: var(--chakra-colors-viBlue2);
    color: white;
    // margin-top: 300px;
    padding: 3rem 0;
    box-shadow: inset 0px -4px 4px rgba(0, 0, 0, 0.25),
      inset 0px 4px 4px rgba(0, 0, 0, 0.25);

    .athletes-inner {
      padding-left: 1rem;
      padding-right: 1rem;
      margin: 0 auto 20px auto;
      max-width: 1200px;
    }

    .athletes-title {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }

    .athletes-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      max-width: 1000px;
    }

    .athletes-subtitle {
      font-size: 1.5rem;
      width: 50%;
    }
  }

  .collector-section {
    margin-top: 150px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;

    .collector-animate-text {
      font-size: 3.5rem;
      ::before {
        animation: ${WordChange} 8s linear infinite;
        content: "Collector";
      }
    }

    .collector-title {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
      overflow: hidden;
      white-space: nowrap;
    }

    .collector-subtitle {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      width: 75%;
    }

    .collector-content {
      display: flex;
      justify-content: space-between;
    }

    .collector-card-box {
      // height: 600px;
      // width: 400px;
    }
  }

  .packs-section {
    margin-bottom: 150px;
    // margin-top: 150px;
    padding: 1rem;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    display: flex;

    .packs-content {
      flex: 1;
    }

    .packs-title {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 2rem;
    }

    .packs-subtitle {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .packs-cards-inner {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .packs-cards {
      flex: 1;
      height: auto;
    }

    .packs-card-box {
      width: 200px;
      height: 325px;
      position: absolute;
      drop-shadow: 0px 4px 4px 0px #00000040;
      
      :hover {
        z-index: 10;
      }
    }

    .packs-card-one {
      top: 0;
      left: 125px;
    }

    .packs-card-two {
      top: 0;
      left: 310px;
    }

    .packs-card-three {
      top: 145px;
      left: 218px;
    }
  }

  @media screen and (max-width: 700px) {
    .btn {
      width: 95%;
    }

    .card-box {
      width: unset;
    }

    .hero {
      flex-direction: column;
      margin-bottom: 100px;
      margin-top: 1rem;
      align-items: center;

      .hero-subtitle {
        font-size: 1.35rem;
        text-align: center;
        width: 90%;
        margin-inline: auto;
      }

      .hero-title {
        width: 100%;
        font-size: 3rem;
        text-align: center;
        font-weight: 700;
        font-family: "Noto Bold", sans-serif;
      }

      .hero-button-row {
        flex-direction: column-reverse;
        justify-content: space-around;
      }

      .tap {
        top: 50px;
        left: 75%;
        height: 55px;
        opacity: 0.5;
        position: relative;
        margin-top: -55px;
      }

      .hero-button-box {
        margin-top: 2rem;
      }

      .hero-right-cards {
        margin-top: -200px;
      }

      .hero-left {
        margin-right: 0;
      }

      .hero-right {
        display: none;
      }

      .hero-card-mobile {
        display: flex;
        justify-content: center;
        margin-top: 1rem;
      }
    }

    .athletes-section {
      margin-top: 75px;
      .athletes-title {
        font-size: 2.5rem;
      }
      .athletes-subtitle {
        width: 100%;
        margin-bottom: 2rem;
      }
      .athletes-content {
        flex-direction: column;
      }
    }

    .collector-section {
      margin-top: 75px;

      .collector-title {
        font-size: 2.5rem;
      }

      .collector-content {
        flex-direction: column;
      }

      .collector-subtitle {
        width: 100%;
      }

      .collector-card-box {
        margin-top: 2rem;
        // height: 500px;
        // width: 250px;
        align-self: center;
        align-items: center;
      }
    }

    .packs-section {
      height: 620px;
      // margin-top: 25px;
      flex-direction: column;

      .packs-content {
        flex: 0;
      }

      .packs-subtitle {
        font-size: 1rem;
      }

      .packs-cards {
        height: 500px;
        width: 100%;
        margin-top: 1rem;
      }

      .packs-card-box {
        width: 150px;
      }

      .packs-card-one {
        left: 35px;
        top: 0;
        z-index: 2;
      }

      .packs-card-two {
        z-index: 1;
        top: 0;
        left: 175px;
      }

      .packs-card-three {
        z-index: 3;
        top: 135px;
        left: 105px;
      }
    }
  }
`;

const Home = () => {
  const [flipMain, setFlipMain] = useState(false);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [packCardSize, setPackCardSize] = useState(150);
  const [cardSize, setCardSize] = useState(350);
  const { width } = useWindowDimensions();
  mixpanel.init('b78dc989c036b821147f68e00c354313')
  mixpanel.track("Home Page Viewed");

  useEffect(() => {
    setTimeout(() => {
      if (!videoPlayed) {
        setFlipMain(true);
        setVideoPlayed(true);
      }
    }, 3500);
  }, [flipMain]);

  useEffect(() => {
    setTimeout(() => {
      if (videoPlayed) {
        setFlipMain(false);
      }
    }, 12000);
  }, [videoPlayed]);

  useEffect(() => {
    if (width && width < 700) {
      // mobile
      setCardSize(300);
      // setPackCardSize(150);
    } else if (width && width >= 700) {
      setCardSize(350);
      // setPackCardSize(200);
    }
  }, [width]);

  return (
    <Wrapper>
      <div className="inner">
        <Box>
          <HStack p="6" bgPos="bottom"
            bgImage="linear-gradient(#1a202d,#1a202d,rgba(0, 0, 0, 0.1)), url('img/basketball-court.jpg')"
            bgSize="cover" alignItems={"center"} justifyContent="center">
            <VStack pr={["unset","4","6"]}>
              <Box ml="1" mb={3} w="fit-content" boxShadow="0 0 100px red" paddingInline={3} paddingBlock={1} bg="red" transform={"auto"} skewX={"-5"} skewY={"-5"}><Heading fontWeight={"bold"} fontSize={"md"}>New Drop!</Heading></Box>
              <Heading fontSize="xl" pb={2} textAlign={"center"}>Eli + Isaac Ellis NFTs</Heading>
              <Button isLoading={submitting} onClick={()=>{setSubmitting(true); window.location.assign("/drops")}}>Tap to Get Yours</Button>
            </VStack>
            <StaticCard nft_id={1449} width={100}></StaticCard>
          </HStack>
        </Box>
        <div className="hero">
          <div className="hero-left">
            <p className="hero-title">The <text className="hero-gradient">Ultimate</text> Rookie Card</p>

            <p className="hero-subtitle">
              Athlete created. Athlete owned. <br />
              Directly invest in the next generation of stars and put money in their hands.
            </p>
            <div className="hero-card-mobile">
              <div className="card-box card-full-opacity">
                <img src="/img/tap.svg" className="tap" alt="tap" />
                <StaticCard nft_id={272} width={400} reverse={flipMain} />
              </div>
            </div>
            <div className="hero-button-row">
              <div className="hero-button-box">
                <p className="hero-button-title">Fans</p>
                <Link href={"/marketplace"}>
                  <Button className="btn btn-white"
                    isLoading={submitting}
                    h={['55px', '55px', 'unset']}
                    onClick={() => { setSubmitting(true) }}
                  >Buy on Marketplace</Button>
                </Link>
              </div>
              <div className="hero-button-box">
                <p className="hero-button-title">Athletes</p>
                <Link href={"/athletes"}>
                  <Button className="btn btn-blue"
                    h={['55px', '55px', 'unset']}
                    isLoading={submitting}
                    onClick={() => { setSubmitting(true) }}
                  >
                    Create Your <span className="bold-txt">VERIFIED</span>INK
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-right-cards">
              <div className="card-box">
                <StaticCard nft_id={301} width={cardSize} />
              </div >
              <div className="card-box">
                <StaticCard nft_id={280} width={cardSize} />
              </div>
              <div className="card-box card-full-opacity">
                <img src="/img/tap.svg" className="tap" alt="tap" />
                <StaticCard nft_id={272} width={cardSize} reverse={flipMain} />
              </div>
              <div className="card-box">
                <StaticCard nft_id={250} width={cardSize} />
              </div>
              <div className="card-box">
                <StaticCard nft_id={230} width={cardSize} />
              </div>
              <div className="card-box">
                <StaticCard nft_id={220} width={cardSize} />
              </div>
              <div className="card-box">
                <StaticCard nft_id={93} width={cardSize} />
              </div>
              <div className="card-box">
                <StaticCard nft_id={152} width={cardSize} />
              </div>
            </div >
            <div className="hero-left-cards">
              <div className="card-box flip">
                <StaticCard nft_id={332} width={cardSize} />
              </div >
              <div className="card-box flip">
                <StaticCard nft_id={174} width={cardSize} />
              </div>
              <div className="card-box flip">
                <StaticCard nft_id={142} width={cardSize} />
              </div>
              <div className="card-box flip">
                <StaticCard nft_id={200} width={cardSize} />
              </div>
            </div >
          </div >
        </div >

        <div className="athletes-section">
          <div className="athletes-inner">
            <p className="athletes-title">Athletes</p>

            <div className="athletes-content">
              <p className="athletes-subtitle">
                VerifiedInk empowers athletes to make money by designing and selling
                their own limited edition NFT showcasing their talent

              </p>
              <Link href={"/athletes"}>
                <Button className="btn btn-white"
                  h={['55px', '55px', 'unset']}
                  isLoading={submitting}
                  onClick={() => { setSubmitting(true) }}>
                  Create Your <span className="bold-txt">VERIFIED</span>INK
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="collector-section">
          <div className="collector-content">
            <div>
              <p className="collector-title">
                As a{" "}
                <motion.span
                  className="blue-txt collector-animate-text"
                  animate={{ content: "k3k3" }}
                ></motion.span>
              </p>
              <p className="collector-subtitle">
                No matter how you’re connected to our Athletes, we know you
                believe in them and want to show your support.
              </p>
              <p className="collector-subtitle">
                Buying a VerifiedInk always directly benefits the Athlete and
                when our Athletes succeed you do too!
              </p>
              <Link href={"/marketplace"}>
                <Button className="btn btn-blue"
                  h={['55px', '55px', 'unset']}
                  isLoading={submitting}
                  onClick={() => { setSubmitting(true) }}
                >Buy on Marketplace</Button>
              </Link>
            </div>
            <div className="collector-card-box">
              <StaticCard nft_id={142} width={cardSize} />
            </div >
          </div >
        </div >

        {/* <div className="packs-section">
          <div className="packs-content">
            <p className="packs-title">Packs</p>
            <p className="packs-subtitle">
              Coming later in 2022, you'll be able to kick start your collection
              with packs.
            </p>
            <p className="packs-subtitle">
              We know you want the chance to snag a Rare or Legendary Ink, and
              packs will have them.
            </p>
            <p className="packs-subtitle">
              We'll also be introducing themed packs based on sports, geography,
              and college conferences.
            </p>
          </div>
          <div className="packs-cards">
            <div className="packs-cards-inner">
              <div className="packs-card-box packs-card-one">
                <StaticCard nft_id={285} width={packCardSize} />
              </div >

              <div className="packs-card-box packs-card-two">
                <StaticCard nft_id={251} width={packCardSize} />
              </div >
              <div className="packs-card-box packs-card-three">
                <StaticCard
                  nft_id={332}
                  width={packCardSize}
                  reverse={true}
                />
              </div>
            </div >
          </div >
        </div > */}
      </div >
      <style global jsx>{`
        html,
        body {
          overflow-x: hidden;
        }
      `}</style>
    </Wrapper >
  );
};

export default Home;
