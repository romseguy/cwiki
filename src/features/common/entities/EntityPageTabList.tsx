import { TabList, TabListProps, useColorMode } from "@chakra-ui/react";
import React from "react";

export const EntityPageTabList = ({ children, ...props }: TabListProps) => {
  return (
    <TabList as="nav" aria-hidden {...props}>
      {children}
    </TabList>
  );
};
