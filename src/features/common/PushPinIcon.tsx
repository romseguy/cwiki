import { Icon, IconProps, Tooltip, useColorMode } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

export const PushPinIcon = ({ ...props }: IconProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Icon {...props} viewBox="0 0 256 256">
      <path
        fill="none"
        stroke={isDark ? "#fff" : "#000"}
        //strokeLinecap="round"
        //strokeLinejoin="round"
        strokeWidth="16"
        d="M219.56836,194.127A15.90364,15.90364,0,0,1,207.19629,200H136v40a8,8,0,0,1-16,0V200H48.80371a16.02766,16.02766,0,0,1-15.66113-19.30273,55.69718,55.69718,0,0,1,23.44433-35.063.31793.31793,0,0,0,.01416-.06885L67.31934,38.40771A15.94952,15.94952,0,0,1,83.23975,24h89.5205a15.94953,15.94953,0,0,1,15.92041,14.40771l10.71827,107.15772a.31793.31793,0,0,0,.01416.06885,55.69528,55.69528,0,0,1,23.44433,35.063h0A16.05708,16.05708,0,0,1,219.56836,194.127Z"
      />
    </Icon>
  );
};

export const PushPinSlashIcon = ({ ...props }: IconProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Icon {...props} viewBox="0 0 256 256">
      <path
        fill="none"
        stroke={isDark ? "#fff" : "#000"}
        //strokeLinecap="round"
        //strokeLinejoin="round"
        strokeWidth="16"
        d="M78.06152,37.38965A8.00035,8.00035,0,0,1,83.97412,24h88.78613a15.94952,15.94952,0,0,1,15.92041,14.40771l11.11475,111.12256a7.99965,7.99965,0,0,1-13.87256,6.18555ZM228.4209,226.62012l-35.99317-39.61133a8.0598,8.0598,0,0,0-.67822-.74707L39.4209,18.62012A8,8,0,0,0,27.5791,29.37988L64.19189,69.67383l-7.59082,75.8916a.32987.32987,0,0,1-.01416.06934,55.69488,55.69488,0,0,0-23.44433,35.0625A16.02766,16.02766,0,0,0,48.80371,200H120v40a8,8,0,0,0,16,0V200h46.61377l33.96533,37.37988a8,8,0,0,0,11.8418-10.75976Z"
      />
    </Icon>
  );
};
