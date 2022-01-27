import styled from "styled-components";

export const CardBox = styled.div`
  max-height: 500px;
  overflow: hidden;
  position: relative;

  .cardbox-refreshicon-div {
    cursor: pointer;
    position: absolute;
    bottom: 15px;
    right: 37px;
  }

  @media screen and (min-width: 30em) {
    .cardbox-refreshicon-div {
      position: absolute;
      bottom: 19px;
      right: 110px;
    }
  }

  @media screen and (min-width: 48em) {
    max-height: unset;
    .cardbox-refreshicon-div {
      position: absolute;
      bottom: 350px;
      right: 102px;
    }
  }
`;
