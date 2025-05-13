import { BoxProps } from "@chakra-ui/react";

export const formBoxProps = (isDark?: boolean): BoxProps => ({
  backgroundColor: isDark ? "whiteAlpha.300" : "white",
  borderColor: isDark ? "whiteAlpha.300" : "transparent",
  borderRadius: "lg",
  borderWidth: 1,
  p: 3,
  mb: 3
});

export const rainbowBorder = (isDark?: boolean) => {
  return isDark
    ? `
                border-image: linear-gradient(to bottom right, #b827fc 0%, #2c90fc 25%, #b8fd33 50%, #fec837 75%, #fd1892 100%);
                border-image-slice: 1;
  `
    : `
                border-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E %3ClinearGradient id='g' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23cffffe' /%3E%3Cstop offset='25%25' stop-color='%23f9f7d9' /%3E%3Cstop offset='50%25' stop-color='%23fce2ce' /%3E%3Cstop offset='100%25' stop-color='%23ffc1f3' /%3E%3C/linearGradient%3E %3Cpath d='M1.5 1.5 l97 0l0 97l-97 0 l0 -97' stroke-linecap='square' stroke='url(%23g)' stroke-width='3'/%3E %3C/svg%3E") 1;
    `;
};

export const rainbowTextCss = (isDark?: boolean) => `
background-clip: text;
background-image: linear-gradient(to left, ${
  isDark
    ? "violet, violet, lightgreen, lightgreen, yellow, orange, red"
    : "violet, purple, teal, teal, teal, purple, violet"
  /*isDark
    ? "violet, violet, lightgreen, lightgreen, yellow, orange, red"
    : "violet, purple, teal, teal, orange, orange, red"*/
});
color: transparent;
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
`;

// https://stackoverflow.com/a/66926531
export const scrollbarCss = `
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  /* Thumb */
  &::-webkit-scrollbar-thumb {
    background: rgba(49, 151, 149, 0.35);
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(49, 151, 149, 1);
  }

  &::-webkit-scrollbar-thumb:active {
    background: #2c7a7b;
  }

  &::-webkit-scrollbar-thumb:horizontal {
    /*border-right: solid 2px rgba(33, 33, 33, 0.5);
    border-left: solid 2px rgba(33, 33, 33, 0.5);*/
  }

  /* Buttons */
  &::-webkit-scrollbar-button {
    display: none;
    /*border-style: solid;
    width: 16px;*/
  }

  /* Left */
  &::-webkit-scrollbar-button:horizontal:decrement {
    /*border-width: 5px 10px 5px 0;*/
    /*border-width: 5px 0px 0px 0px;*/
    border-color: transparent #319795 transparent transparent;
  }

  &::-webkit-scrollbar-button:horizontal:decrement:hover {
    border-color: transparent #2c7a7b transparent transparent;
  }

  /* Right */
  &::-webkit-scrollbar-button:horizontal:increment {
    /*border-width: 5px 0 5px 10px;*/
    border-color: transparent transparent transparent #319795;
  }

  &::-webkit-scrollbar-button:horizontal:increment:hover {
    border-color: transparent transparent transparent #2c7a7b;
  }
`;
