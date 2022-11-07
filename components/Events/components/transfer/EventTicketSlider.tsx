import { Box } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import Slider from "react-slick";
import { map } from "lodash";

import useTicketHooks, { TICKET } from "../../hooks/useTicketHooks";
import TicketCard from "../TicketCard";

interface EventTicketSliderProps {
  tickets: any[];
  isSuccess?: boolean;
}

const EventTicketSlider = (props: EventTicketSliderProps) => {
  const { tickets, isSuccess } = props;

  const slider = useRef<any>(null);
  const settings = {
    dots: true,
    infinite: false,
    centerMode: true,
    initialSlide: 0,
    focusOnSelect: false,
    arrows: false,
    touchMove: true,
    slide: "div",
    appendDots: (dots: any) => {
      return (
        <Box display="flex" justifyContent="center" alignItems="center">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={8}
          >
            {map(dots, (dot) => (
              <Box
                key={dot.key}
                {...dot.props}
                width="10px"
                height="10px"
                marginX="2"
                background={
                  dot.props.className.includes("slick-active")
                    ? "white"
                    : "gray.500"
                }
                fontSize="2"
                color={
                  dot.props.className.includes("slick-active")
                    ? "white"
                    : "gray.500"
                }
                rounded="full"
              />
            ))}
          </Box>
        </Box>
      );
    },
  };

  const [sliderImageHeight, setSliderImageHeight] = React.useState(380);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSliderImageHeight(window.innerHeight < 800 ? 280 : 380);
    }
  }, [typeof window !== "undefined" && window.innerHeight]);

  return (
    <Box>
      <Slider ref={slider} {...settings}>
        {typeof window !== "undefined" && tickets && tickets.map((ticket: any, index: any) => {
          return (
            <Box
              {...props}
              onClick={() => {
                slider.current.slickGoTo(index);
              }}
              key={index}
              width={["100%","400px"]}
              height={`${sliderImageHeight}px`}
              p={2}
            >
              <TicketCard ticket={ticket} isDark={isSuccess} />
            </Box>
          );
        })}
      </Slider>
    </Box>
  );
};

export default EventTicketSlider;
