import { Button, Box, Text } from "@chakra-ui/react";

interface Props {
    text: string;
    textSize: string;
    color: string;
    shadow: string;
    disabled: boolean;
}
// react component for a button with props for background color, text, shadow color and click handler
const TransformButton = (props: Props) => {
    const { text, color, shadow, textSize, disabled } = props;
    return (
        <Button
            bg={color}
            padding=".5rem 1.25rem"
            // display="flex"
            // maxW={"300px"}
            // flex="1"
            h="auto"
            border={`0.5px solid ${shadow}`}
            boxShadow={`0px 0px 20px white,
                        0px 0px 30px ${shadow}`}
            transform={`matrix(0.89, 0, -0.58, 1, 0, 0)`}
            sx={{
                "> div": {
                    transform: "matrix(1, 0, 0.64, 1, 0, 0)",
                },
            }}
            fontSize={textSize}
            disabled={disabled}
        >
            <Box mb=".25rem" mx="1rem" >
                {text}
            </Box>
        </Button>
    );
}

export default TransformButton;

