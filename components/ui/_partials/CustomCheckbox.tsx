import { Box, useCheckbox } from "@chakra-ui/react";
import { BiCheck } from "react-icons/bi";

interface CustomCheckboxProps {
  onChange: () => void;
  checked?: boolean;
}
const CustomCheckbox = (props: CustomCheckboxProps) => {
  const { state, getInputProps, getCheckboxProps, htmlProps } = useCheckbox({
    isChecked: props.checked,
    onChange: () => props.onChange(),
  });
  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label" {...htmlProps} onClick={() => props.onChange()}>
      <input {...input} hidden onChange={() => props.onChange()} />
      <Box
        {...checkbox}
        cursor="pointer"
        rounded="md"
        height="40px"
        width="40px"
        position="absolute"
        top="0"
        left="0"
        bg="#000729"
        zIndex="999"
        border="1px solid #0E9DE5"
        display="flex"
        justifyContent="center"
        alignItems="center"
        _hover={{
          rounded: "md",
        }}
        _checked={{
          bg: "#0E9DE5",
          color: "white",
          border: "none",
          boxShadow: "none",
        }}
      >
        {state.isChecked ? <BiCheck size="30" /> : null}
      </Box>
    </Box>
  );
};

export default CustomCheckbox;
