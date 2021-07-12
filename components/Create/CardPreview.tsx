import Nft from "@/types/Nft";
import React, { useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";

interface Props {
  photoFile: object | null;
  nft: Nft | null;
}

interface CardStyleProps {
  width: number;
  height: number;
  display: string;
  color: string;
}

const Wrapper = styled.div<CardStyleProps>`
  position: relative;
  .card-size {
    width: 100%;
    max-width: 500px;
  }
  .card-img {
    display: block;
    object-fit: contain;
  }

  .card-overlay-position {
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 3;
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    padding: 1.5rem;
  }
  .card-overlay {
    display: ${(props) => props.display};
    position: relative;
    z-index: 5;
    border: 2px solid ${(props) => props.color};
    width: 100%;
    height: 100%;

    flex-direction: column;
    justify-content: flex-end;
    padding: 2rem;

    .card-name {
      font-weight: bold;
      color: white;
      font-size: 2rem;
      -webkit-text-stroke-width: 0.5px;
      -webkit-text-stroke-color: ${(props) => props.color};
    }

    .card-info {
      font-weight: bold;
      color: white;
      font-size: 1.5rem;
      -webkit-text-stroke-width: 0.5px;
      -webkit-text-stroke-color: ${(props) => props.color};
    }

    .card-vfied-tag {
      opacity: 0.4;
      position: absolute;
      right: 10px;
      top: 10px;
      background: ${(props) => props.color};
      color: white;
      padding: 5px 10px;
      border-radius: 20px;
    }
  }
`;

const CardPreview = ({ photoFile, nft }: Props) => {
  const imgSrc =
    typeof photoFile === "string" ? photoFile : URL.createObjectURL(photoFile);

  const ref: React.MutableRefObject<any> = useRef(null);

  const [imgSize, setImgSize] = useState({
    width: 0,
    height: 0,
    display: "none",
  });

  useLayoutEffect(() => {
    setTimeout(() => {
      if (ref) {
        setImgSize({
          ...imgSize,
          width: ref.current.width,
          height: ref.current.height,
          display: "flex",
        });
      }
    }, 100);
  }, [ref, photoFile]);

  let blueColor = "#0085FF";

  return (
    <Wrapper
      color={blueColor}
      width={imgSize.width}
      height={imgSize.height}
      display={imgSize.display}
    >
      <img
        ref={ref}
        style={{ minHeight: "100%" }}
        className="card-img card-size"
        src={imgSrc}
        alt=""
      />
      <div className="card-size card-overlay-position">
        <div className="card-overlay">
          <span className="card-vfied-tag">vfied 21</span>
          <p className="card-name">
            {nft?.first_name} {nft?.last_name}
          </p>
          <p className="card-info">
            {nft?.sport_position} `{nft?.graduation_year} - {nft?.high_school}
          </p>
        </div>
      </div>
    </Wrapper>
  );
};

export default CardPreview;
