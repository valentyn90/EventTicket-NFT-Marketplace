import styled, { css, keyframes } from "styled-components";

interface StyleProps {
  signatureFile: string | null;
  rotation: number | null;
  nftWidth: number;
  topColor: string;
  bottomColor: string;
  transitionColor: string;
  founders: boolean;
  smallCardSize: boolean;
  editionRarity: string;
  editionName: string;
}

const ShinyAnimationCss = css`
  @keyframes shiny {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  animation: shiny 10s ease infinite;
`;

export const CardWrapper = styled.div<StyleProps>`
  position: relative;
  font: Lato;
  display: flex;
  justify-content: center;
  align-self: center;


  
  ${(props) =>
    // Glow from the whole card - doesnt work on safari
    props.editionRarity === "Legendary" &&
    `will-change: filter;
     filter: drop-shadow( 0 0 20px gold) ;
    `
   
  }
  

  ${(props: StyleProps) =>
    `transform: scale(calc(${props.nftWidth} / 600));
      height: ${props.nftWidth * 1.65}px;
      width: ${props.nftWidth}px;
    `}

  transform-origin: top center;

  ${(props) =>
    !props.smallCardSize &&
    `@media only screen and (max-width: 600px) {
      transform: scale(calc(350 / 600));
      transform-origin: top center;
      height: ${350 * 1.65}px;
      width: ${350}px;
    }`}

  .card {
    position: absolute;
    width: 544px;
    height: 975px;
    left: 0px;
    bottom: 0px;
  }
  .background {
    position: absolute;
    width: 544px;
    height: 897px;
    left: 0px;
    bottom: 0px;
  }
  .border-mask-bottom {
    position: absolute;
    width: 544px;
    height: 897px;
    left: 0px;
    bottom: 0px;
    ${(props) =>
    //Common standard border
    props.editionRarity === "Common" ?
      `background: #00000010;`
      :
      props.editionRarity === "Legendary"  ?
        // `background: radial-gradient(ellipse, #cfc09f 60%, rgba(255,255,255,.8) 95%);`
        `background: url(/img/gold.jpg);
        background-size: cover;
        `
        :
        props.editionRarity === "Rare" && props.editionName === "Extended" ?
        `background: url(/img/silver.jpg);
         background-size: cover;`
        :
        //Legendary + Launch/Base border
        `background: #ffffff78;`
  }
    mix-blend-mode: normal;
    mask-image: url(/img/border-mask-bottom.png);
    mask-repeat: no-repeat;
    mask-position: top center;
  }

  .background-gradient {
    position: absolute;
    left: 0%;
    right: 0%;
    top: 0%;
    bottom: 0%;
    ${(props) =>
    props.founders
      ?
      `background: 
      radial-gradient(
        circle in center,
          #bf953f,
          #fcf6ba,
          #b38728,
          #fbf5b7,
          #aa771c
          );
        background-size: 400% 400%;
        ${ShinyAnimationCss}`
      :
      (props.editionRarity === "Legendary" && props.editionName != "Extended") ?
        // Legendary Launch/Base
        ` background-image: linear-gradient( rgba(0,0,0,.2), rgba(0,0,0,.5) ), url(/img/gold.jpg);
          background-size: cover;` 
        :

        `background-image: 
        // linear-gradient( rgba(212,175,55,.3), rgba(212,175,55,.3) ),
        linear-gradient(
        219.17deg,
        ${props.topColor} -10.14%,
        ${props.transitionColor} 48.6%,
        ${props.bottomColor} 101.53%
        );`

  }
    mix-blend-mode: normal;
    mask-image: url(/img/card-mask.png);
    mask-repeat: no-repeat;
    mask-position: top center;

    
  }
  .background-img {
    position: absolute;
    width: 740px;
    left: 0px;
    top: 0px;
    mask-image: linear-gradient(to bottom,rgba(0,0,0,1) 85%, rgba(0,0,0,0) 98%); 
  }


  // .name-gradient {
  //   text-shadow:
  //       0 0 14px rgb(239 239 240),
  //       0 0 21px rgb(239 239 240),
  //       0 0 42px #3f7bfb,
  //       0 0 82px #3f7bfb,
  //       0 0 92px #3f7bfb,
  //       0 0 102px #3f7bfb;
  // }

  .crop-background-img {
    position: absolute;
    width: 521px;
    height: 750px;
    overflow: hidden;
    left: 12px;
    top: -80px;
    ${(props: StyleProps) => `transform: rotate(${props.rotation}deg);`}
  }
  .overlay-gradient {
    mask-image: url(/img/card-mask-gradient.png);
  }
  .background-stripes {
    position: absolute;
    top: 0%;
    width: 521.71px;
    height: 100%;
    left: 50%;
    transform: translate(-50%);
    opacity: 30%;
    background: url(/img/stripes.png);
    background-size: 550px;
  }
  .signature {
    position: absolute;
    bottom: 8%;
    left: 50%;
    transform: translate(-50%);
    width: 250px;
    height: 150px;
    mask-image: ${(props) => `url(${props.signatureFile})`};
    mask-size: 250px auto;
    mask-repeat: no-repeat;
    ${(props) =>
      props.editionRarity === "Legendary" && props.editionName === "Extended" ?
      `background: url(/img/gold.jpg);`
      :
      `background: white;`
    }
    
  }
  .serial-number {
    position: absolute;
    bottom: 5%;
    text-align: center;
    font-weight: 100;
    font-size: 18px;
    left: 50%;
    transform: translate(-50%);
    display: inline;
    color: #ffffff7a;
  }
  .athlete-name {
    position: absolute;
    bottom: 40%;
    left: 50%;
    transform: translate(-50%);
    font-size: 64px;
    font-weight: 900;
    text-align: center;
    line-height: 65px;

    ${(props) =>
    props.editionRarity === "Legendary" && props.editionName === "Extended" ?
      `min-height: 135px;
       color:#c3a343;
       background: url(/img/gold.jpg) repeat;
       background-clip: text;
       -webkit-text-fill-color: transparent;
       -webkit-background-clip: text;
       `
      :
      props.editionRarity === "Rare" && props.editionName === "Extended" ?
      `min-height: 135px;
       color:#c3a343;
       background: url(/img/silver-name.jpg) repeat;
       background-clip: text;
       background-size: cover;
       -webkit-text-fill-color: transparent;
       -webkit-background-clip: text;
       `
      :

      `color: #ffffff;`
  }

  }
  .athlete-school {
    position: absolute;
    top: 62%;
    left: 50%;
    transform: translate(-50%);
    font-size: 22px;
    font-weight: 200;
    text-align: center;
    color: white;
    width: 400px;
    opacity: 80%;
  }
  .background-name {
    font-size: 100px;
    line-height: 95px;
    transform: rotate(90deg);
    transform-origin: top left;
    position: absolute;
    left: 530px;
    top: 85px;
    color: #ffffff00;
    text-overflow: clip;
    text-align: left;

    width: 580px;
    min-height: 400px;
    overflow: hidden;
    white-space: nowrap;
    -webkit-text-stroke: 1px white;
    opacity: 50%;
  }
  .verified-logo {
    position: absolute;
    left: 5%;
    top: 75px;
    opacity: 30%;
  }
  .bold-info {
    font-style: normal;
    font-weight: 900;
    display: inline;
    color: white;
    font-size: 20px;
  }
  .info-heading {
    font-weight: 100;
    display: inline;
    color: #ffffff7a;
    font-size: 18px;
  }
  .info-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    width: 150px;
  }
  .basic-info {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-start;
    width: 460px;
    text-align: center;
    position: absolute;
    top: 67%;
    left: 50%;
    transform: translate(-50%);
  }

  .reverse-background-mask {
    mask-image: url(/img/reverse-background.png);
    mask-repeat: no-repeat;
    mask-position: top center;
    overflow: hidden;
  }

  .background-video-centered {
    position: absolute;
    top: 0px;
    display: block;
    min-height: 898px;
    max-height: 950px;
    min-width: 544px;
    max-width: 3000px;
    vertical-align: center;
    left: 50%;
    transform: translate(-50%);
  }

  .background-video {
    position: absolute;
    top: 0px;
    display: block;
    min-height: 898px;
    max-height: 950px;
    min-width: 544px;
    max-width: 3000px;
    vertical-align: center;
    // left: 50%;
    // transform: translate(-50%);
  }

  .reverse-logo-background {
    position: absolute;
    top: 0px;
    height: 300px;
    width: 100%;
    background: linear-gradient(
      180deg,
      #000d52 -25.39%,
      rgba(107, 117, 170, 0.452044) 80.43%,
      rgba(196, 196, 196, 0) 100%
    );
  }

  .reverse-verified-logo {
    position: absolute;
    top: 60px;
    left: 50%;
    transform: translate(-50%) scale(1.5);
    z-index: 2;
  }

  .reverse-name-background {
    position: absolute;
    background-color: #000d52;
    bottom: 0px;
    width: 100%;
    height: 180px;
    opacity: 80%;
  }

  .reverse-athlete-name {
    top: 81.5%;
    width: 200px;
    font-size: 32px;
    line-height: 38px;
  }

  .card-container {
    background: transparent;
    position: relative;
    transform-style: preserve-3d;
    // perspective: 200px;
    transform-origin: center;
  }

  .front {
    z-index: 2;
    backface-visibility: hidden;
    transform: rotateY(0deg);
  }

  .reverse {
    backface-visibility: hidden;
    transform: rotateY(180deg);
  }

  .viewer {
  }

  .fullscreen {
    position: absolute;
    top: 90px;
    right: 10px;
    height: 30px;
    width: 50px;
    color: white;
    opacity: 30%;
  }

  .loading-spinner {
    transform: scale(2);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;
