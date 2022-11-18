interface Props {
  fill: string;
}

const ChevronRight = ({ fill }: Props) => (
  <svg
    width="8"
    height="14"
    viewBox="0 0 8 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.61091 6.63523L0.841971 0.289347C0.522638 -0.0100272 0 0.216396 0 0.654116V13.3459C0 13.7836 0.522638 14.01 0.841971 13.7107L7.61091 7.36477C7.82162 7.16723 7.82162 6.83277 7.61091 6.63523Z"
      fill={fill}
    />
  </svg>
);

export default ChevronRight;
