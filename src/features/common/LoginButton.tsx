import { Button, ButtonProps } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { FaKey } from "react-icons/fa";

export const LoginButton = ({
  children,
  onClick,
  ...props
}: ButtonProps & {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  return (
    <Button
      colorScheme="teal"
      leftIcon={<FaKey />}
      onClick={(e) => {
        onClick && onClick(e);
        router.push("/login", "/login", {
          shallow: true
        });
      }}
      data-cy="login-button"
      {...props}
    >
      {children}
    </Button>
  );
};
