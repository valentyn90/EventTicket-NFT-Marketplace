import Card from "@/components/NftCard/Card";
import React, { useEffect, useLayoutEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import Link from "next/link";
import { Skeleton, Stack } from "@chakra-ui/react";
import useWindowDimensions from "@/utils/useWindowDimensions";

const WordChange = keyframes`
  0% { content: "Collector" }
  20% { content: "Fan" }
  40% { content: "Friend" }
  60% { content: "Mom" }
  80% { content: "Brother" }
`;

const Wrapper = styled.div`
  /* overflow: hidden; */
  background: radial-gradient(
    231.34% 231.34% at 21.53% 17.78%,
    #1a202d 7.33%,
    #152547 100%
  );
  min-height: 100vh;

  .inner {
    overflow: hidden;
  }

  .bold-txt {
    font-weight: bold;
  }

  .blue-txt {
    color: var(--chakra-colors-viBlue2);
  }

  .card-box {
    width: 325px;
    height: 500px;
    opacity: 0.1;
  }

  .card-box {
    width: 325px;
    height: 500px;
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
      margin-right: 50%;
    }

    .hero-button-row {
      display: flex;
      justify-content: space-between;
    }

    .hero-button-box {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
      width: 70%;
    }

    .hero-subtitle {
      font-size: 1.5rem;
    }

    .hero-button-title {
      font-weight: bold;
      font-size: 1.25rem;
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
        animation: ${WordChange} 15s linear infinite;
        content: "Collector";
      }
    }

    .collector-title {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
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
      height: 600px;
      width: 400px;
    }
  }

  .packs-section {
    margin-bottom: 150px;
    margin-top: 150px;
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
      width: 100%;
    }

    .hero {
      flex-direction: column;
      margin-bottom: 100px;
      margin-top: 1rem;

      .hero-subtitle {
        font-size: 1.25rem;
        text-align: center;
      }

      .hero-title {
        width: 100%;
        font-size: 2.5rem;
        text-align: center;
      }

      .hero-button-row {
        flex-direction: column;
        justify-content: space-around;
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
        height: 500px;
        width: 250px;
        align-self: center;
      }
    }

    .packs-section {
      height: 620px;
      margin-top: 25px;
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
  const [initFlipMain, setInitFlipMain] = useState(false);
  const [videoPlayed, setVideoPlayed] = useState(false);

  const [packCardSize, setPackCardSize] = useState(200);
  const [cardSize, setCardSize] = useState(350);
  const { width } = useWindowDimensions();

  useEffect(() => {
    setTimeout(() => {
      if (!videoPlayed) {
        if (!initFlipMain) {
          setInitFlipMain(true);
        }
        setFlipMain(true);
        setVideoPlayed(true);
      }
    }, 4000);
  }, [flipMain]);

  useEffect(() => {
    setTimeout(() => {
      if (videoPlayed) {
        setFlipMain(false);
      }
    }, 15000);
  }, [videoPlayed]);

  useEffect(() => {
    if (width && width < 700) {
      // mobile
      setCardSize(300);
      setPackCardSize(150);
    } else if (width && width >= 700) {
      setCardSize(350);
      setPackCardSize(200);
    }
  }, [width]);

  return (
    <Wrapper>
      <div className="inner">
        <div className="hero">
          <div className="hero-left">
            <p className="hero-title">The Ultimate Rookie Card</p>

            <p className="hero-subtitle">
              Show your support for future NCAA, NBA and NFL stars when they
              need it most, before they get big.
            </p>
            <div className="hero-card-mobile">
              <div className="card-box card-full-opacity">
                <Card
                  nft_id={272}
                  readOnly={true}
                  nft_width={cardSize}
                  initFlip={initFlipMain}
                  flip={flipMain}
                />
              </div>
            </div>
            <div className="hero-button-row">
              <div className="hero-button-box">
                <p className="hero-button-title">Fans</p>
                <Link href={"/marketplace"}>
                  <button className="btn btn-blue">Buy on Marketplace</button>
                </Link>
              </div>
              <div className="hero-button-box">
                <p className="hero-button-title">Athletes</p>
                <Link href={"/athletes"}>
                  <button className="btn btn-white">
                    Create Your <span className="bold-txt">VERIFIED</span>INK
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-right-cards">
              <div className="card-box">
                <Card nft_id={301} readOnly={true} nft_width={cardSize} />
              </div>
              <div className="card-box">
                <Card nft_id={280} readOnly={true} nft_width={cardSize} />
              </div>
              <div className="card-box card-full-opacity">
                <Card
                  nft_id={272}
                  readOnly={true}
                  nft_width={cardSize}
                  initFlip={initFlipMain}
                  flip={flipMain}
                />
              </div>
              <div className="card-box">
                <Card nft_id={250} readOnly={true} nft_width={cardSize} />
              </div>
              <div className="card-box">
                <Card nft_id={230} readOnly={true} nft_width={cardSize} />
              </div>
              <div className="card-box">
                <Card nft_id={220} readOnly={true} nft_width={cardSize} />
              </div>
              <div className="card-box">
                <Card nft_id={93} readOnly={true} nft_width={cardSize} />
              </div>
              <div className="card-box">
                <Card nft_id={152} readOnly={true} nft_width={cardSize} />
              </div>
            </div>
            <div className="hero-left-cards">
              <div className="card-box flip">
                <Card nft_id={167} readOnly={true} nft_width={cardSize} />
              </div>
              <div className="card-box flip">
                <Card nft_id={174} readOnly={true} nft_width={cardSize} />
              </div>
              <div className="card-box flip">
                <Card nft_id={142} readOnly={true} nft_width={cardSize} />
              </div>
              <div className="card-box flip">
                <Card nft_id={200} readOnly={true} nft_width={cardSize} />
              </div>
            </div>
          </div>
        </div>

        <div className="athletes-section">
          <div className="athletes-inner">
            <p className="athletes-title">Athletes</p>

            <div className="athletes-content">
              <p className="athletes-subtitle">
                VerifiedInk empowers amateur athletes like you to create, mint
                and sell limited edition NFTs showcasing your talent.
              </p>
              <Link href={"/athletes"}>
                <button className="btn btn-white">
                  Create Your <span className="bold-txt">VERIFIED</span>INK
                </button>
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
                <button className="btn btn-blue">Buy on Marketplace</button>
              </Link>
            </div>
            <div className="collector-card-box">
              <Card nft_id={142} readOnly={true} nft_width={cardSize} />
            </div>
          </div>
        </div>

        <div className="packs-section">
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
                <Card nft_id={285} readOnly={true} nft_width={packCardSize} />
              </div>

              <div className="packs-card-box packs-card-two">
                <Card nft_id={251} readOnly={true} nft_width={packCardSize} />
              </div>
              <div className="packs-card-box packs-card-three">
                <Card
                  nft_id={316}
                  readOnly={true}
                  nft_width={packCardSize}
                  reverse={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <style global jsx>{`
        html,
        body {
          overflow-x: hidden;
        }
      `}</style>
    </Wrapper>
  );
};

export default Home;
