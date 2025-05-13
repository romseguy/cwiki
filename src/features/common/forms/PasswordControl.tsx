import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement
} from "@chakra-ui/react";
import { ErrorMessage } from "@hookform/error-message";
import React, { useState } from "react";
import { FaKey } from "react-icons/fa";

export const PasswordControl = ({
  label = "Password",
  errors,
  register,
  isRequired = true,
  noLabel,
  ...props
}: FormControlProps & {
  errors: any;
  name?: string;
  register: any;
  isRequired?: boolean;
  noLabel?: boolean;
}) => {
  const name = props.name || "password";
  const [passwordFieldType, setPasswordFieldType] = useState("password");

  return (
    <FormControl isRequired={isRequired} isInvalid={!!errors[name]} {...props}>
      {!noLabel && <FormLabel>{label}</FormLabel>}
      <InputGroup>
        <InputLeftElement pointerEvents="none" children={<FaKey />} />
        <Input
          name={name}
          ref={register(
            isRequired
              ? {
                  required: "Please input a password"
                }
              : undefined
          )}
          type={passwordFieldType}
          placeholder="Input your password..."
          data-cy="password-input"
        />
        <InputRightElement
          cursor="pointer"
          children={
            passwordFieldType === "password" ? <ViewOffIcon /> : <ViewIcon />
          }
          onClick={() => {
            if (passwordFieldType === "password") setPasswordFieldType("text");
            else setPasswordFieldType("password");
          }}
        />
      </InputGroup>
      <FormErrorMessage>
        <ErrorMessage errors={errors} name={name} />
      </FormErrorMessage>
    </FormControl>
  );
};
