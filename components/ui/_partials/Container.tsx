import { Container as AppContainer } from "@chakra-ui/react";

interface ContainerProps {
  children: React.ReactNode;
  py?: number | string;
}

const Container = (props: ContainerProps) => {
  const { children, py } = props;
  return (
    <AppContainer maxW={["xl", "8xl"]} py={py || 6}>
      {children}
    </AppContainer>
  );
};

export default Container;
