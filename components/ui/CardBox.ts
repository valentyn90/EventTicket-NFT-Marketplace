import styled from "styled-components";

export const CardBox = styled.div`
  max-height: 500px;
  overflow: hidden;
  position: relative;

  .cardbox-refreshicon-div {
    cursor: pointer;
    position: absolute;
    bottom: 15%;
    right: 13%;
  }

  @media screen and (min-width: 30em) {
    .cardbox-refreshicon-div {
      position: absolute;
      bottom: 7%;
      right: 17%;
    }
  }

  @media screen and (min-width: 48em) {
    max-height: unset;
    .cardbox-refreshicon-div {
      position: absolute;
      bottom: 10%;
      right: 15%;
    }
  }
`;
