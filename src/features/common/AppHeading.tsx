import {
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  useColorMode
} from "@chakra-ui/react";
import { useToast } from "hooks/useToast";

import { css } from "@emotion/react";
import { rainbowTextCss } from "features/layout/theme";
import theme from "features/layout/theme";
import { forwardRef } from "react";

export const AppHeading = forwardRef(
  (
    {
      children,
      fontFamily = theme.fonts.roboto,
      noContainer,
      smaller,
      ...props
    }: HeadingProps & {
      children: React.ReactNode;
      fontFamily?: string;
      noContainer?: boolean;
      smaller?: boolean;
    },
    ref
  ) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const element = (
      <Heading
        as={props.as ? props.as : smaller ? "h2" : "h1"}
        fontFamily={fontFamily}
        fontSize={smaller ? "2xl" : ["3xl", "4xl"]}
        css={css(rainbowTextCss(isDark))}
        {...props}
      >
        {children}
      </Heading>
    );

    if (noContainer) return element;
    return <Flex>{element}</Flex>;
  }
);
