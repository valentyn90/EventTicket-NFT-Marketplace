import Nft from "@/types/Nft";
import { useUser } from "@/utils/useUser";
import { Wrap } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { observer } from "mobx-react-lite";
import { nftInput } from "@/mobx/NftInput";
import { toJS } from "mobx";

const Wrapper = styled.div<Props>`
  position: relative;
  font: Lato;

  .card {
    width: 544px;
    height: 940px;
    margin-right: 10px;
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
  }

  .background-img {
    position: absolute;
    width: 500px;
    left: 50%;
    transform: translate(-50%);
    top: -80px;
    object-fit: cover;
    object-position: center top;
    max-height: 600px;
    // mask-image: linear-gradient(180deg, rgba(0,0,0,1) 83%, rgba(210,208,213,0) 100%);
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
`;

interface Props {
  signatureFile: string | null;
}

const Card = () => {
  const { photoFile, signatureFile, nft, checkSignatureFile, checkPhotoFile } =
    useUser();

  const [viewportWidth, setVieportWidth] = useState(800);
  const updateMedia = () => {
    setVieportWidth(window.innerWidth);
  };

  useEffect(() => {
    // console.log(nft?.photo_file);
    async function checkSignature() {
      await checkSignatureFile();
    }
    async function checkPhoto() {
      await checkPhotoFile();
    }
    if (nft?.photo_file) {
      checkPhoto();
    }
    if (nft?.signature_file) {
      checkSignature();
    }
  }, [nft?.signature_file, nft?.photo_file]);

  useEffect(() => {
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

  let imgSrc;

  if (photoFile) {
    imgSrc =
      typeof photoFile === "string"
        ? photoFile
        : URL.createObjectURL(photoFile);
  } else {
    imgSrc = "/img/qb-removebg.png";
  }

  const fullName = `${nftInput.firstName} ${nftInput.lastName}`;
  return (
    <Wrapper signatureFile={signatureFile || null} style={{ transform: `scale(${Math.min(1.0, viewportWidth / 600)})`, transformOrigin: `top left` }}>
      <div className="card">
        <div className="background">
          <div className="background-gradient">
            <div className="background-stripes"></div>

            <div className="background-name">{nftInput.firstName}<br />{nftInput.lastName}</div>
          </div>

          {imgSrc && <img className="background-img" src={imgSrc} />}
          <img className="verified-logo" src="/img/card-logo.svg" />
          <div className="background-gradient overlay-gradient"></div>

          <div className="athlete-name">{fullName}</div>
          <div className="basic-info">
            <div className="info-group">
              <div className="info-heading">Year</div>
              <div className="bold-info">'{nftInput.gradYear}</div>
            </div>
            <div className="info-group">
              <div className="info-heading">Position</div>
              <div className="bold-info">{nftInput.sportPosition}</div>
            </div>
            <div className="info-group">
              <div className="info-heading">Hometown</div>
              <div className="bold-info">
                {nftInput.highSchool}, {nftInput.usaState}
              </div>
            </div>
            <div className="info-group">
              <div className="info-heading">Sport</div>
              <div className="bold-info">
                {nftInput.sport}
              </div>
            </div>
          </div>
          <div className="signature"></div>
          <div className="serial-number">
            <div className="bold-info">1</div>/100
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default observer(Card);
