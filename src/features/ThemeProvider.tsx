import { ChakraProvider, cookieStorageManager } from "@chakra-ui/react";
import { GlobalStyles } from "features/layout";
import theme from "features/layout/theme";
import { PropsWithChildren } from "react";
import { useSelector } from "react-redux";
import { selectIsMobile } from "store/uiSlice";

export function ThemeProvider({
  cookies,
  children
}: PropsWithChildren<{
  cookies?: string;
}>) {
  const isMobile = useSelector(selectIsMobile);
  return (
    <ChakraProvider
      resetCSS
      theme={theme}
      colorModeManager={cookieStorageManager(cookies)}
    >
      <GlobalStyles isMobile={isMobile} />
      {children}
    </ChakraProvider>
  );
}
