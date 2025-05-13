import { GridItemProps } from "@chakra-ui/react";
import React from "react";
import { GridItem } from "./GridItem";

export const GridHeader = ({
  children,
  light = {},
  dark = {},
  pl = 3,
  ...props
}: GridItemProps & {
  light?: GridItemProps;
  dark?: GridItemProps;
}) => {
  return (
    <GridItem
      light={{ bg: "orange.300", ...light }}
      dark={{ bg: "whiteAlpha.300", ...dark }}
      pl={pl}
      {...props}
    >
      {children}
    </GridItem>
  );
};
