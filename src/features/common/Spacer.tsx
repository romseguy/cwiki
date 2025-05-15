import {
  BorderProps,
  Box,
  Spacer as ChakraSpacer,
  Heading,
  SpacerProps,
  Text,
  useColorModeValue
} from "@chakra-ui/react";
import React from "react";
import theme from "features/layout/theme";

export const Spacer = ({
  light = { borderColor: theme.colors.black },
  dark = { borderColor: "white" },
  ...props
}: BorderProps &
  SpacerProps &
  SpacerProps & {
    light?: { [key: string]: string };
    dark?: { [key: string]: string };
  }) => {
  const styles = useColorModeValue(light, dark);
  return <ChakraSpacer {...styles} {...props} />;
};
