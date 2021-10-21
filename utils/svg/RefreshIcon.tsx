import React from "react";

interface Props {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  width?: string;
  height?: string;
  color?: string;
}

const RefreshIcon: React.FC<Props> = ({
  top,
  left,
  right,
  bottom,
  width,
  height,
  color,
}) => {
  return (
    <svg
      style={{ top, left, right, bottom, width, height, color }}
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.51 7.00001C4.01717 5.5668 4.87913 4.28542 6.01547 3.27543C7.1518 2.26545 8.52547 1.55978 10.0083 1.22427C11.4911 0.888766 13.0348 0.934356 14.4952 1.35679C15.9556 1.77922 17.2853 2.56473 18.36 3.64001L22.5 8M1 12L5.64 16.36C6.71475 17.4353 8.04437 18.2208 9.50481 18.6432C10.9652 19.0657 12.5089 19.1113 13.9917 18.7758C15.4745 18.4402 16.8482 17.7346 17.9845 16.7246C19.1209 15.7146 19.9828 14.4332 20.49 13"
        stroke="#787878"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RefreshIcon;
