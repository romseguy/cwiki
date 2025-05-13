import {
  BorderProps,
  Grid as ChakraGrid,
  GridProps,
  SpacerProps,
  useColorModeValue
} from "@chakra-ui/react";
import React from "react";

export const Grid = ({
  children,
  light,
  dark,
  ...props
}: GridProps & {
  light?: { [key: string]: any };
  dark?: { [key: string]: any };
}) => {
  const styles = useColorModeValue(light, dark);
  return (
    <ChakraGrid {...styles} {...props}>
      {children}
    </ChakraGrid>
  );
};
