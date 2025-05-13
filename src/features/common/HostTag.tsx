import { Tag, TagProps } from "@chakra-ui/react";
import React from "react";

export const HostTag = ({ ...props }: TagProps) => {
  return (
    <Tag colorScheme="red" {...props}>
      {process.env.NEXT_PUBLIC_SHORT_URL}
    </Tag>
  );
};
