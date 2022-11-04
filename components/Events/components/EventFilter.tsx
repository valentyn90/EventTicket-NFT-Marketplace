import { CloseIcon } from "@chakra-ui/icons";
import { HStack, VStack, Text, Stack, Select, Box } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

type EventFilterOption = {
  label: string;
  value: string;
  icon?: React.ReactElement;
};

interface EventFilterProps {
  placeholder: string;
  options: EventFilterOption[];
}

const EventFilter = (props: EventFilterProps) => {
  const { placeholder, options } = props;
  const [showFilter, setShowFilter] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlert(wrapperRef);

  function useOutsideAlert(ref: any) {
    useEffect(() => {
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowFilter(false);
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  return (
    <div ref={wrapperRef}>
      <VStack display="inline-block" position="relative">
        <HStack>
          <Box width="100px">
            <Text color={"whiteAlpha.600"}>Filter by:</Text>
          </Box>
          <Select placeholder="Select ticket level">
            {(options || []).map((item: EventFilterOption) => (
              <option value={item.value}>{item.label}</option>
            ))}
          </Select>
        </HStack>
      </VStack>
    </div>
  );
};

export default EventFilter;
