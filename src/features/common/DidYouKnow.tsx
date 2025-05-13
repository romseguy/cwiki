import { Icon, QuestionIcon } from "@chakra-ui/icons";
import { Alert, AlertProps, Box } from "@chakra-ui/react";
import React from "react";

export const DidYouKnow = ({
  children,
  ...props
}: AlertProps & { children: React.ReactNode | React.ReactNodeArray }) => {
  return (
    <Alert status="info" {...props}>
      <Icon as={QuestionIcon} boxSize={5} color="blue.500" />
      <Box ml={3}>{children}</Box>
    </Alert>
  );
};
