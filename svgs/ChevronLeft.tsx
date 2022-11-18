interface Props {
  fill: string;
}

const ChevronLeft = ({ fill }: Props) => (
  <svg
    width="8"
    height="14"
    viewBox="0 0 8 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.389087 7.36477L7.15803 13.7107C7.47736 14.01 8 13.7836 8 13.3459L8 0.654116C8 0.216396 7.47736 -0.0100269 7.15803 0.289348L0.389086 6.63523C0.17838 6.83277 0.178381 7.16723 0.389087 7.36477Z"
      fill={fill}
    />
  </svg>
);

export default ChevronLeft;
