import { useColorMode } from "@chakra-ui/react";
import React from "react";

interface Props {
  width: string;
  height: string;
}

const ViLogo: React.FC<Props> = ({ width, height }) => {
  const { colorMode } = useColorMode();
  if (colorMode === "light") {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M54.4378 41.9611H0L25.7889 86.628L27.2197 89.1056L54.4378 41.9611Z"
          fill="black"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M110.566 28.0399L120 11.6104H87.4989L78.0703 28.0399H110.566Z"
          fill="black"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M58.0974 120L102.622 41.9612H70.1459L35.325 103.146L45.0563 120H58.0974Z"
          fill="black"
        />
      </svg>
    );
  } else {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M54.4378 41.9611H0L25.7889 86.6279L27.2197 89.1055L54.4378 41.9611Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M110.566 28.0398L120 11.6103H87.4989L78.0703 28.0398H110.566Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M58.0974 120L102.622 41.9611H70.1459L35.325 103.146L45.0563 120H58.0974Z"
            fill="#4688F1"
          />
        </g>
        <defs>
          <clipPath id="clip0">
            <rect
              width="120"
              height="120"
              fill="white"
              transform="matrix(1 0 0 -1 0 120)"
            />
          </clipPath>
        </defs>
      </svg>
    );
  }
};

export default ViLogo;
