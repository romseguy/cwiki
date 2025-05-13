import { Text } from "@chakra-ui/react";
import React from "react";
import { css } from "@emotion/react";

const styles = {
  color: "red"
};
//
// becomes:
// const styles = css`
//   ${tw`text-red-600`}
//   font-weight: bold
// `;
// = tailwind classes + SASS

export const ErrorMessageText = ({
  children
}: {
  children: React.ReactNode | React.ReactNodeArray;
}) => {
  return <Text css={styles}>{children}</Text>;
};
