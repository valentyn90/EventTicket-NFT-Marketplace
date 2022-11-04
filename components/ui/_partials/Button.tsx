import { Button as ChakraButton, Text } from "@chakra-ui/react";

interface ButtonProps extends React.ComponentProps<typeof ChakraButton> {
  isTrapigium?: boolean;
  buttonLabel: string;
}
const Button = (props: ButtonProps) => {
  const { isTrapigium, buttonLabel, disabled, ...rest } = props;
  return (
    <ChakraButton
      transform={isTrapigium ? "matrix(0.89, 0, -0.58, 1, 0, 0)" : ""}
      disabled={disabled}
      {...rest}
    >
      <Text
        transform={isTrapigium ? "matrix(1, 0, 0.5, 0.8, 0, 0)" : ""}
        textTransform="uppercase"
        textAlign="center"
        fontWeight="bold"
        letterSpacing="xl"
      >
        {buttonLabel}
      </Text>
    </ChakraButton>
  );
};

export default Button;
