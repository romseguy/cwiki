import { Icon, IconProps, Tooltip, useColorMode } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

export const OfflineIcon = ({}: IconProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Tooltip
      label="Connectez-vous à internet pour continuer à utiliser l'application."
      placement="top-start"
      hasArrow
    >
      <Icon viewBox="0 0 256 256" boxSize={8}>
        <line
          x1="48"
          x2="208"
          y1="40"
          y2="216"
          fill="none"
          stroke="red"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="16"
        />
        <path
          fill="none"
          stroke={isDark ? "#fff" : "#000"}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="16"
          d="M107.12984 57.47077a148.358 148.358 0 0 1 20.86235-1.46787 145.90176 145.90176 0 0 1 102.9284 42.17662M25.06379 98.17952A145.88673 145.88673 0 0 1 72.42537 66.8671M152.11967 106.95874a97.88568 97.88568 0 0 1 44.88614 25.1619M58.97857 132.12064a97.89874 97.89874 0 0 1 49.03639-26.105M92.91969 166.06177a50.81565 50.81565 0 0 1 67.576-2.317"
        />
        <circle cx="128" cy="200" r="12" fill={isDark ? "#fff" : "#000"} />
      </Icon>
    </Tooltip>
  );
};
