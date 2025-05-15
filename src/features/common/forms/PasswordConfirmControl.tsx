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
import theme from "features/layout/theme";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { FaKey } from "react-icons/fa";

export const PasswordConfirmControl = ({
  label = "Confirmation du mot de passe",
  errors,
  name,
  register,
  isRequired = false,
  password,
  placeholder = "Saisir un mot de passe...",
  ...props
}: FormControlProps & {
  label?: string;
  errors: any;
  name: string;
  register: any;
  isRequired?: boolean;
  password: React.MutableRefObject<string | undefined>;
  placeholder?: string;
}) => {
  const { t } = useTranslation();
  const [passwordConfirmFieldType, setPasswordConfirmFieldType] =
    useState("password");

  return (
    <FormControl isRequired={isRequired} isInvalid={!!errors[name]} {...props}>
      <FormLabel>{label}</FormLabel>
      <InputGroup>
        <InputLeftElement pointerEvents="none" children={<FaKey />} />
        <Input
          name={name}
          ref={register({
            validate: (value: string) =>
              value === password.current || t("passwordConfirmMismach")
          })}
          type={passwordConfirmFieldType}
          placeholder={placeholder}
        />
        <InputRightElement
          cursor="pointer"
          children={
            passwordConfirmFieldType === "password" ? (
              <ViewOffIcon />
            ) : (
              <ViewIcon />
            )
          }
          onClick={() => {
            if (passwordConfirmFieldType === "password")
              setPasswordConfirmFieldType("text");
            else setPasswordConfirmFieldType("password");
          }}
        />
      </InputGroup>
      <FormErrorMessage>
        <ErrorMessage errors={errors} name={name} />
      </FormErrorMessage>
    </FormControl>
  );
};
