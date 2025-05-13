import { Input, InputProps } from "@chakra-ui/react";
import React from "react";

export const FileInput = ({ accept = "*", ...props }: InputProps) => {
  return <Input {...props} type="file" variant="solid" />;
};
