import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  font: Lato;

  .card {
    width: 540px;
    height: 940px;
    margin-right: 10px;
  }

  .background {
    position: absolute;
    width: 540px;
    height: 880px;
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
    mask-image: url(/img/card-mask.svg);
    mask-repeat: no-repeat;
  }

  .background-img {
    position: absolute;
    width: 740px;
    left: 0px;
    top: -80px;
  }

  .overlay-gradient {
    mask-image: url(/img/card-mask-gradient.svg);
  }

  .signature {
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translate(-50%);
    width: 250px;
    height: 150px;
    mask-image: url(/img/signature.png);
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

  .bold-info {
    font-style: normal;
    font-weight: 900;
    display: inline;
    color: white;
    font-size: 24px;
  }
  .info-heading {
    font-weight: 100;
    display: inline;
    color: #ffffff7a;
    font-size: 22px;
  }

  .info-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px;
  }

  .basic-info {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    width: 450px;

    position: absolute;
    bottom: 30%;
    left: 50%;
    transform: translate(-50%);
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
  }

  .background-name {
    font-size: 120px;
    line-height: 120px;

    transform: rotate(90deg);

    position: absolute;
    left: 200px;
    top: 120px;
    color: #ffffff00;

    -webkit-text-stroke: 1px white;
  }

  .verified-logo {
    position: absolute;
    left: 5%;
    top: 3%;
    opacity: 30%;
  }

  .stripe {
    position: absolute;
    opacity: 40%;
  }
`;

const Card = () => {
  return (
    <Wrapper>
      <div className="card">
        <div className="background">
          <div className="background-gradient">
            <div className="background-name">BOBBY SMITH</div>
          </div>
          <img className="stripe" src="/img/stripe.svg" />

          <img className="background-img" src="/img/qb-removebg.png" />
          <img className="verified-logo" src="/img/card-logo.svg" />
          <div className="background-gradient overlay-gradient"></div>
          <img className="stripe overlay-gradient" src="/img/stripe.svg" />

          <div className="athlete-name">Bobby Smith</div>
          <div className="basic-info">
            <div className="info-group">
              <div className="info-heading">Year</div>
              <div className="bold-info">'22</div>
            </div>
            <div className="info-group">
              <div className="info-heading">Position</div>
              <div className="bold-info">Quarterback</div>
            </div>
            <div className="info-group">
              <div className="info-heading">Hometown</div>
              <div className="bold-info">Highland Park, IL</div>
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

export default Card;
