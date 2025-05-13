import { QuestionIcon } from "@chakra-ui/icons";
import {
  Icon,
  TabProps,
  chakra,
  useColorMode,
  useStyles
} from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import { selectIsMobile } from "store/uiSlice";

//@ts-ignore
const Tab = chakra("button", { themeKey: "Tabs.Tab" });

export const EntityPageTab = ({
  children,
  currentTabIndex,
  tab,
  tabIndex,
  ...props
}: TabProps & {
  children: React.ReactNode | React.ReactNodeArray;
  currentTabIndex: number;
  tab: Record<string, any>;
  tabIndex: number;
  onClick?: () => void;
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const isMobile = useSelector(selectIsMobile);
  const isCurrent = tabIndex === currentTabIndex;
  //const tabProps = useTab(props);
  //const styles = useMultiStyleConfig("Tabs", tabProps);
  //const styles = useTabsStyles();
  const styles = useStyles();

  return (
    <Tab
      aria-selected={isCurrent}
      __css={{
        ...styles.tab,
        ...(isMobile
          ? {
              display: "flex",
              alignItems: "center",
              padding: "12px",
              justifyContent: "center"
            }
          : {
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            })
      }}
      {...props}
    >
      <Icon
        as={tab.icon || QuestionIcon}
        boxSize={8}
        __css={{
          ...(isMobile ? {} : {})
        }}
        mr={!children || tab.label === "" || tab.label === "Accueil" ? 0 : 2}
      />

      {children}
    </Tab>
  );
};

//EntityPageTab.whyDidYouRender = true;

{
  /*
  return (
    <Tab
      // {...tabProps}
      aria-selected={isCurrent}
      __css={{
        ...styles.tab,
        display: "flex",
        bgColor: isCurrent ? undefined : isDark ? "gray.800" : "white",
        p: 4,
        _focus: {
          boxShadow: "none"
        },
        _hover: { bgColor: "blue.400", color: "white" },
        ...(isMobile
          ? {
              alignSelf: "flex-start",
              alignItems: "center",
              mb: 3,
              ml: 3,
              mt: tabIndex === 0 ? 3 : 0
            }
          : { flex: 0, mr: 3 })
      }}
      {...props}
    >
      <Icon
        as={tab.icon || QuestionIcon}
        boxSize={8}
        mr={!isMobile && (tab.label === "" || tab.label === "Accueil") ? 0 : 2}
      />
      {children}
    </Tab>
  );
*/
}
