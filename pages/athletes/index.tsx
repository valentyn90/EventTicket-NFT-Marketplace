import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Card from "@/components/NftCard/Card";
import Cookies from "cookies";
import Link from "next/link";
import { NextApiRequest, NextApiResponse } from "next";
import { SplashModal } from "@/components/ui/SplashModal";
import StaticCard from "@/components/NftCard/StaticCard";
import mixpanel from 'mixpanel-browser';
import { Button, Spacer } from "@chakra-ui/react";
import { FaPen, FaPenAlt, FaPenFancy, FaSignature } from "react-icons/fa";

const Wrapper = styled.div`
  background-color: var(--chakra-colors-blueBlack);
  
  // radial-gradient(
  //   231.34% 231.34% at 21.53% 17.78%,
  //   var(--chakra-colors-blueBlack) 7.33%,
  //   var(--chakra-colors-blueBlack2) 100%
  // );

  padding: 2rem 0;

  .inner {
    margin-left: auto;
  }

  .page-section {
    display: flex;
    flex-direction: column;
    gap: 50px;
    margin-bottom: 100px;
  }

  // .page-section-margin {
  //   margin-bottom: 250px;
  // }

  // .hero-section-margin {
  //   margin-top: 100px;
  //   height: 100vh;
  // }

  .center-section {
    align-items: center;
    justify-content: center;
  }

  .header {
    font-size: 3rem;
    font-weight: bold;
  }

  .gradient {
    text-shadow:
        0 0 14px rgb(239 239 240),
        0 0 21px rgb(239 239 240),
        0 0 42px #3f7bfb,
        0 0 82px #3f7bfb,
        0 0 92px #3f7bfb,
        0 0 102px #3f7bfb;
  }

  .subtitle {
    font-size: 1.5rem;
  }

  .margin-button {
    margin-top: 1rem;
  }

  .sub-box {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    max-width: 500px;
  }

  .hero-card-box {
    // height: 600px;
    flex-direction: column;
    align-items: center;
  }

  .title-grid {
    display: flex;
    flex-direction: column;
    // align-items: left;
    // gap: 10px;
    margin-bottom: 20px;
  }

  .hero-column {
    display: flex;
    flex-direction: column;
  }

  .hero-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .center-margin {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .scroll-margin {
    margin-left: calc((100% - 1200px) / 2);
  }

  .athlete-first-content {
    display: flex;

    > p {
      flex: 1;
    }
  }

  .athlete-first-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
  }

  .athlete-first-text {
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 1rem;
  }

  .four-percent-box {
    flex: 1;
    display: flex;
  }

  .four-percent-boxes {
    display: flex;
    > div {
      margin-right: 15px;
    }
  }

  .icon-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    justify-content: center;
  }

  .tap {
    top: 55px;
    left: 75%;
    height: 55px;
    opacity: 0.5;
    position: relative;
    margin-top: -55px;
  }

  .text-section {
    display: flex;
    flex-direction: column;
    align-items: left;
  }

  .card-section {
    display: flex;
    flex-direction: row;
    align-items: top;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }

  .buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
  }

  .button {
    text-align: center;
    padding: 16px;
    cursor: pointer;
    color: white;
    background: var(--chakra-colors-viBlue2);
    transition: all 300ms ease-out;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    font-size: 16px;
    box-shadow: 0px 4px 4px 0px #00000040;
  }

  .hero-section {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
  }

  .hero-section-block {
    flex: 1;
    padding-right: 2rem;
    /* border: 1px solid white; */
  }

  .hero-section-title {
    font-weight: bold;
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .line-section {
    border-bottom: 1px solid white;
    width: 45%;
    margin-bottom: 1.5rem;
  }

  .img {
    background-size: contain;
    background-repeat: no-repeat;
  }

  .svg-icon {
    --size: 26px;
    height: var(--size);
    width: var(--size);
    background-repeat: no-repeat;
  }

  .social-button {
    opacity: 1;
    cursor: pointer;
    transition: opacity 300ms ease-out;
  }

  .our-mission-content {
    display: flex;
  }

  .our-mission-ink-cards {
    flex: 2;
    display: flex;
    overflow: hidden;
    margin-left: 1rem;
  }

  .our-mission-card-box {
    width: 400px;
    height: 650px;
  }

  .mobile-margin-top {
    margin-top: 0;
  }

  .flex-1 {
    flex: 1;
  }

  .mb-1 {
    margin-bottom: 1rem;
  }

  .mb-2 {
    margin-bottom: 2rem;
  }

  .icon-svg-div {

    > svg {
      height: 120px;
    }
  }

  .how-it-works-title {
    flex: 1;
    margin-top: 2rem;
    font-weight: bold;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .how-it-works-subtitle {
    flex: 1;
    width: 75%;
    text-align: center;
  }

  .mt-5 {
    margin-top: 5rem;
  }

  .max-w-100 {
    max-width: 100%;
  }

  .mobile-padding {
    padding: 0;
  }

  .left-mobile-padding {
    padding: 0;
  }

  @media screen and (max-width: 800px) {
    padding-top: 1rem;

    .hero-card-mobile {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
    }

    .hero-section-margin {
      margin-bottom: 100px;
    }

    .our-mission-content {
      flex-direction: column;
    }

    .page-section-margin {
      margin-bottom: 50px;
    }

    .our-mission-ink-cards {
      margin-top: 2rem;
      overflow: auto;
      margin-left: 0;
    }

    .mobile-padding {
      padding: 0 1rem;
    }

    .left-mobile-padding {
      padding-left: 1rem;
    }

    .mt-5 {
      margin-top: 3rem;
    }

    .icon-box {
      margin-bottom: 3rem;
    }

    .hero-row {
      flex-direction: column;
    }

    .athlete-first-content {
      flex-direction: column;
    }

    .athlete-first-box {
      margin: 2rem 0;
    }

    .athlete-first-text {
      align-self: center;
    }

    .scroll-margin {
      margin: 0;
    }

    .title-grid {
      grid-gap: 10px;
      flex-direction: column;
    }

    .header {
      font-size: 2.5rem;
      font-weight: bold;
    }

    .subtitle {
      font-size: 1rem;
    }

    .button {
      font-size: 18px;
    }

    .margin-button {
      margin-bottom: 1rem;
    }

    .inner {
      margin-left: 0;
      margin-right: 0;
    }

    .hero-section {
      display: none;
    }

    // .our-mission-card-box {
    //   height: 510px;
    // }
  }

  @media screen and (max-width: 389px) {
    .mobile-margin-top {
      margin-top: 100px;
    }
  }

  @media screen and (max-width: 300px) {
    .header {
      font-size: 3rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .button {
      padding: 8px;
      font-size: 1rem;
    }
  }
`;

const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      type: "spring",
      damping: 8,
      staggerChildren: 0.5,
      when: "beforeChildren",
    },
  },
};

const containerHowVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      // delay: 3.5,
      type: "spring",
      damping: 8,
      staggerChildren: 1,
      when: "beforeChildren",
    },
  },
};

const childVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  },
};

const headerVariants = {
  hidden: {
    opacity: 0,
    // scale: 30,
    // y: 400
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: .4
    }
  }
}

// interface Props {
//   splashBypass: boolean;
// }

const Athletes: React.FC = () => {

  mixpanel.init('b78dc989c036b821147f68e00c354313')
  const [flip1, setFlip1] = useState(true);
  const [flip2, setFlip2] = useState(false);
  const [flip3, setFlip3] = useState(true);
  const [flip4, setFlip4] = useState(false);
  const [flipMain, setFlipMain] = useState(false);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [loading, setLoading] = useState(false);

  mixpanel.track("Athletes Page Viewed");

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     console.log('interval');
  //     const randomNumber = Math.floor(Math.random() * 4);

  //     if (randomNumber === 0) {
  //       setFlip1(!flip1);
  //     } else if (randomNumber === 1) {
  //       setFlip2(!flip2);
  //     } else if (randomNumber === 2) {
  //       setFlip3(!flip3);
  //     } else if (randomNumber === 3) {
  //       setFlip4(!flip4);
  //     }
  //   }, 10000);

  //   return () => clearInterval(intervalId);
  // });

  useEffect(() => {
    setTimeout(() => {

      setFlipMain(true);
      setVideoPlayed(true);

    }, 5000)

  }, []);

  useEffect(() => {
    if (videoPlayed) {
      setTimeout(() => {
        setFlipMain(false);
      }, 10000)
    }

  }, [videoPlayed]);

  return (

    <Wrapper>
      <div className="inner">
        <motion.div
          className="page-section hero-section-margin mobile-padding"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="hero-row center-margin">
            <div>
              <div className="title-grid">
                <motion.div variants={headerVariants} className="header">
                  Your Career
                </motion.div>
                <motion.div
                  variants={headerVariants}
                  className="header"
                >
                  Your Journey
                </motion.div>
                <motion.div variants={headerVariants} className="header gradient">
                  Your Collectible
                </motion.div>
              </div>
              <motion.div variants={childVariants} className="sub-box">
                <p className="subtitle">
                  VerifiedInk is the first place for athletes like you to design, own,
                  and sell their own limited edition AR Digital Trading Card.
                  {/* Design, own, and sell your limited edition NFTs. */}
                </p>
                <p className="subtitle">
                Completely free to make. Show it off with physcial AR Cards for a small fee.
                </p>
                <div className="buttons margin-button">
                  <Link href="/create/step-1">
                    <Button className="button"
                      isLoading={loading}
                      onClick={() =>{setLoading(true)}}
                    >
                      Create your&nbsp;<span className="bold-text">VERIFIED</span>INK
                    </Button>
                  </Link>
                </div>
                <div className="hero-section">
                  <div className="hero-section-block">
                    <div className="line-section"></div>
                    <p className="hero-section-title">2 Minute Drill</p>
                    <p className="hero-section-subtitle">
                      We make creating your first Digital Trading Card as easy as posting to your
                      favorite social media app - it takes 2 minutes.
                    </p>
                  </div>
                  <div className="hero-section-block">
                    <div className="line-section"></div>
                    <p className="hero-section-title">IRL</p>
                    <p className="hero-section-subtitle">
                      Starting at $20, you can view your Digital Collectible IRL with 
                      our unique physical Augmented Reality (AR) Card. 
                  
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            <motion.div className="max-w-100" variants={childVariants}>
              <div className="hero-card-mobile">
              <div className="hero-card-box mb-2">
              <img src="/img/tap.svg" className="tap" alt="tap" />
                <StaticCard nft_id={763}
                  reverse={flipMain}
                  width={400}
                />
              </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="page-section page-section-margin mobile-margin-top mobile-padding"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerHowVariants}
        >
          <div className="hero-column center-margin">
            <motion.p className="header" variants={childVariants}>
              How It Works
            </motion.p>
            <div className="hero-row mt-5">
              <motion.div className="icon-box" variants={childVariants}>
                <div className="icon-svg-div">
                  <StarIcon />
                </div>
                <p className="how-it-works-title">Design</p>
                <p className="how-it-works-subtitle">
                  Take 2 minutes to create your VerifiedInk
                </p>
              </motion.div>
              <motion.div className="icon-box" variants={childVariants}>
                <div className="icon-svg-div">
                  <FaSignature size={130}/>
                </div>
                <p className="how-it-works-title">Sign</p>
                <p className="how-it-works-subtitle">
                  Mint your VerifiedInk to the Blockchain (we make it easy)
                </p>
              </motion.div>
              <motion.div className="icon-box" variants={childVariants}>
                {/* <div className="icon-svg-div"> */}
                <video width={"120"} autoPlay loop muted playsInline>
                        <source
                            src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-safari.mp4"
                            type='video/mp4; codecs="hvc1"' />
                        <source
                            src="https://epfccsgtnbatrzapewjg.supabase.co/storage/v1/object/public/private/videos/ar-card-vp9-chrome.webm"
                            type="video/webm" />
                    </video>
                {/* </div> */}
                <p className="how-it-works-title">Hold</p>
                <p className="how-it-works-subtitle">
                  Show off your creation with our Physical AR Card
                </p>
              </motion.div>
            </div>
            <Spacer p={8} />
            <div className="buttons margin-button">
                  <Link href="/create/step-1">
                  <Button className="button"
                      isLoading={loading}
                      onClick={() =>{setLoading(true)}}
                    >
                      Create your &nbsp; <span className="bold-text">VERIFIED</span>INK
                    </Button>
                  </Link>
                </div>
          </div>
        </motion.div>

        <motion.div
          className="page-section page-section-margin"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="hero-row center-margin">
            <div className="flex-1">
              <motion.p
                className="header mobile-padding"
                variants={childVariants}
              >
                Athlete First
              </motion.p>


              <motion.p
                className="subtitle mobile-padding"
                variants={childVariants}
              >
                We want you to own your image, and earn the most you can from it.
                We take a small fee, but only when you sell it - not before.
                And the best part? Your collectibles come with forever royalties -
                so you get a cut of every single sale other people make too.
                Your career is in your hands. Your collectibles should be too.

              </motion.p>
            </div>

            <motion.div
              className="athlete-first-box mobile-padding"
              variants={childVariants}
            >
              <img src="/img/basketball-image.png" alt="" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="page-section page-section-margin"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="hero-row scroll-margin">
            <motion.div className="flex-1" variants={childVariants}>
              <p className="header mobile-padding">Our Mission</p>
              <div className="sub-box flex-1 mobile-padding">
                <p className="subtitle">
                  Our mission is to empower all athletes by making it
                  easy for you to capitalize on your years of hard work and
                  talent. Our goal is to bring millions of athletes just like
                  you into Web3 as creators. Like you, we’re just getting
                  started.
                </p>
                <div className="buttons margin-button">
                  <Link href="/create/step-1">
                  <Button className="button"
                      isLoading={loading}
                      onClick={() =>{setLoading(true)}}
                    >
                      Create your &nbsp; <span className="bold-text">VERIFIED</span>INK
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="our-mission-ink-cards"
              variants={childVariants}
            >
              <div className="our-mission-card-box">
                <StaticCard
                  nft_id={316}
                  width={400}
                  reverse={flip1}
                />
              </div>
              <div className="our-mission-card-box">
                <StaticCard
                  nft_id={142}
                  width={400}
                  reverse={flip2}
                />
              </div>
              <div className="our-mission-card-box">
                <StaticCard
                  nft_id={174}
                  width={400}
                  reverse={flip3}
                />
              </div>
              <div className="our-mission-card-box">
                <StaticCard
                  nft_id={167}
                  width={400}
                  reverse={flip4}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Wrapper>
  )
};

const StarIcon = () => (
  <svg
    width="81"
    height="80"
    viewBox="0 0 81 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.3333 2.5V19.1667M3 10.8333H19.6667M15.5 60.8333V77.5M7.16667 69.1667H23.8333M44.6667 2.5L54.1905 31.0714L78 40L54.1905 48.9286L44.6667 77.5L35.1429 48.9286L11.3333 40L35.1429 31.0714L44.6667 2.5Z"
      stroke="#F2F2F2"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TagIcon = () => (
  <svg
    width="81"
    height="80"
    viewBox="0 0 81 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.6667 19.1667H19.7083M19.6667 2.5H40.5C42.6328 2.49994 44.7653 3.31353 46.3926 4.94078L75.5595 34.1074C78.8138 37.3618 78.8138 42.6382 75.5595 45.8926L46.3926 75.0592C43.1382 78.3136 37.8618 78.3136 34.6074 75.0592L5.44078 45.8926C3.8136 44.2654 3 42.1327 3 40V19.1667C3 9.96192 10.4619 2.5 19.6667 2.5Z"
      stroke="#F2F2F2"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CashIcon = () => (
  <svg
    width="81"
    height="64"
    viewBox="0 0 81 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M61.3333 19.5V11.1666C61.3333 6.56427 57.6024 2.83331 53 2.83331H11.3333C6.73096 2.83331 3 6.56427 3 11.1666V36.1666C3 40.769 6.73096 44.5 11.3333 44.5H19.6667M28 61.1667H69.6667C74.269 61.1667 78 57.4357 78 52.8333V27.8333C78 23.2309 74.269 19.5 69.6667 19.5H28C23.3976 19.5 19.6667 23.2309 19.6667 27.8333V52.8333C19.6667 57.4357 23.3976 61.1667 28 61.1667ZM57.1667 40.3333C57.1667 44.9357 53.4357 48.6666 48.8333 48.6666C44.231 48.6666 40.5 44.9357 40.5 40.3333C40.5 35.7309 44.231 32 48.8333 32C53.4357 32 57.1667 35.7309 57.1667 40.3333Z"
      stroke="#F2F2F2"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// export async function getServerSideProps({
//   req,
//   res,
//   query,
// }: {
//   req: NextApiRequest;
//   res: NextApiResponse;
//   query: any;
// }) {
//   let splashBypass = false;
//   // Check if user has cookie
//   const cookies = new Cookies(req, res);

//   const splashCookie = cookies.get("SplashBypass");
//   console.log("we're here")

//   // check if splashbypass cookie was set to true
//   if (splashCookie && splashCookie === "true") {
//     splashBypass = true;
//   } else {
//     // check if access code is in url
//     if (query.referralCode && query.referralCode !== "") {
//       splashBypass = true;
//       cookies.set("SplashBypass", "true");
//     }
//   }

//   return {
//     props: {
//       splashBypass,
//     },
//   };
// }

export default Athletes;
