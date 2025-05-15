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

export const PasswordControl = ({
  label = "Mot de passe",
  errors,
  register,
  isRequired = false,
  noLabel,
  placeholder = "Saisir un mot de passe...",
  ...props
}: FormControlProps & {
  errors: any;
  name?: string;
  register: any;
  isRequired?: boolean;
  noLabel?: boolean;
  placeholder?: string;
}) => {
  const { t } = useTranslation();
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
                  required: t("required")
                }
              : undefined
          )}
          type={passwordFieldType}
          placeholder={placeholder}
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
