import { Flex, FlexProps, Heading, useColorMode } from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";

export const TabContainer = ({ children, mb = 5, ...props }: FlexProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Flex
      flexDirection="column"
      //bg={isDark ? "gray.700" : "cyan.100"}
      borderTopRadius="lg"
      mb={mb}
      {...props}
    >
      {children}
    </Flex>
  );
};

export const TabContainerHeader = ({
  children,
  heading,
  ...props
}: FlexProps & {
  heading?: string | React.ReactNode;
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Flex
      alignItems="center"
      bg={isDark ? "#63B3ED" : "#2B6CB0"}
      color={isDark ? "black" : "white"}
      borderTopRadius="lg"
      cursor={heading ? "default" : "pointer"}
      py={3}
      tabIndex={0}
      _hover={{
        backgroundColor: isDark ? "blue.400" : "blue.400",
        color: isDark ? "white" : undefined
      }}
      {...props}
    >
      {heading ? (
        <Heading size="sm" pl={3}>
          {heading}
        </Heading>
      ) : (
        children
      )}
    </Flex>
  );
};

export const TabContainerContent = ({ children, ...props }: FlexProps & {}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Flex
      flexDirection="column"
      bg={`rgba(${isDark ? "255,255,255,0.1" : "0,0,0,0.1"})`}
      borderBottomRadius="lg"
      {...props}
    >
      {children}
    </Flex>
  );
};
