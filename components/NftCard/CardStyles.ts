import styled from "styled-components";

interface StyleProps {
  signatureFile: string | null;
  rotation: number | null;
  nftWidth: number;
}

export const CardWrapper = styled.div<StyleProps>`
  position: relative;
  font: Lato;
  display: flex;
  justify-content: center;

  ${(props: StyleProps) => `transform: scale(calc(${props.nftWidth} / 600));`}

  transform-origin: top center;

  @media only screen and (max-width: 600px) {
    transform: scale(calc(400 / 600));
    transform-origin: top center;
  }

  .card {
    position: absolute;
    width: 544px;
    height: 975px;
  }
  .background {
    position: absolute;
    width: 544px;
    height: 897px;
    left: 0px;
    bottom: 0px;
  }
  .background-gradient {
    position: absolute;
    left: 0%;
    right: 0%;
    top: 0%;
    bottom: 0%;
    background: linear-gradient(
      219.17deg,
      #4f66e1 -10.14%,
      #3d142d 48.6%,
      #cb0000 101.53%
    );
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
  }

  .crop-background-img {
    position: absolute;
    width: 100%;
    height: 750px;
    overflow: hidden;
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
    background: white;
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
    color: white;
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
    width: 60px;
  }
  .basic-info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    width: 460px;
    text-align: center;
    position: absolute;
    top: 63%;
    left: 50%;
    transform: translate(-50%);
  }

  .reverse-background-mask {
    mask-image: url(/img/reverse-background.png);
    mask-repeat: no-repeat;
    mask-position: top center;
    overflow: hidden;
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
    left: 50%;
    transform: translate(-50%);
  }

  .reverse-logo-background {
    position: absolute;
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
    top: 82%;
    width: 200px;
    font-size: 36px;
    line-height: 38px;
  }

  .card-container {
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
`;
