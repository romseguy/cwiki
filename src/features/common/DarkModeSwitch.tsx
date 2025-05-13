import {
  Icon,
  IconButton,
  IconButtonProps,
  useColorMode
} from "@chakra-ui/react";
import React from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import Toggle, { ToggleProps } from "react-toggle";

export const DarkModeSwitch = ({
  toggleProps,
  ...props
}: Omit<IconButtonProps, "aria-label"> & {
  toggleProps?: ToggleProps;
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  if (toggleProps)
    return (
      <Toggle
        checked={isDark}
        icons={{
          checked: <FaMoon color="white" />,
          unchecked: <FaSun color="white" />
        }}
        onChange={toggleColorMode}
        {...toggleProps}
      />
    );
  else
    return (
      <IconButton
        aria-label={
          isDark
            ? "Basculer le site en couleur claire"
            : "Basculer le site en couleur sombre"
        }
        icon={<Icon as={isDark ? FaSun : FaMoon} />}
        onClick={toggleColorMode}
        {...props}
      />
    );
};
