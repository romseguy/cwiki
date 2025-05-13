import { AtSignIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  CSSObject,
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightAddon,
  InputRightElement
} from "@chakra-ui/react";
import { ErrorMessage } from "@hookform/error-message";
import React from "react";
import { useFieldArray } from "react-hook-form";
import { emailR } from "utils/email";

import { Link } from "../Link";

type EmailControlValue = [{ email: string }] | null;

export const EmailControl = ({
  name,
  errors,
  register,
  defaultValue,
  label = "Email",
  noLabel,
  control,
  setValue,
  containerProps = {},
  inputProps = {},
  isMultiple = true,
  isRequired = false,
  placeholder = "Input your email address...",
  onRightElementClick,
  ...props
}: FormControlProps & {
  name: string;
  errors: any;
  register: any;
  defaultValue?: string;
  label?: string;
  noLabel?: boolean;
  control?: any;
  //setValue?: (name: string, value: EmailControlValue | string) => void;
  setValue?: any;
  containerProps?: CSSObject;
  inputProps?: InputProps;
  isMultiple?: boolean;
  isRequired?: boolean;
  placeholder?: string;
  onRightElementClick?: () => void;
}) => {
  let formRules: { required?: string | boolean } = {};

  if (isRequired) {
    formRules.required = "Please input your email address";
  }

  if (!isMultiple) {
    return (
      <FormControl
        isRequired={isRequired}
        isInvalid={!!errors[name]}
        {...props}
      >
        {!noLabel && <FormLabel>{label}</FormLabel>}

        <InputGroup>
          <InputLeftElement pointerEvents="none" children={<AtSignIcon />} />
          <Input
            type="email"
            name={name}
            placeholder={placeholder}
            ref={register({
              pattern: {
                value: emailR,
                message: "Adresse e-mail invalide"
              },
              ...formRules
            })}
            defaultValue={defaultValue}
            pl={10}
            {...inputProps}
            data-cy="email-input"
          />
          {noLabel && onRightElementClick && (
            <InputRightElement
              pointerEvents="none"
              children={<Icon as={AtSignIcon} onClick={onRightElementClick} />}
            />
          )}
        </InputGroup>

        <FormErrorMessage>
          <ErrorMessage errors={errors} name={name} />
        </FormErrorMessage>
      </FormControl>
    );
  }

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control, // control props comes from useForm (optional: if you are using FormContext)
      name // unique name for your Field Array
      // keyName: "id", default to "id", you can change the key name
    }
  );

  return (
    <Box sx={containerProps}>
      {fields.map((field, index) => {
        return (
          <FormControl
            key={field.id}
            id={name}
            isRequired={isRequired}
            isInvalid={errors[name] && errors[name][index]}
            {...props}
          >
            {!noLabel && (
              <FormLabel m={0}>
                {index > 0 ? `${index + 1}ème ${label.toLowerCase()}` : label}
              </FormLabel>
            )}
            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                children={<AtSignIcon />}
              />
              <Input
                type="email"
                name={`${name}[${index}].email`}
                placeholder={placeholder}
                defaultValue={`${field.email}`} // make sure to set up defaultValue
                ref={register({
                  pattern: {
                    value: emailR,
                    message: "Adresse e-mail invalide"
                  },
                  ...formRules
                })}
              />
              <InputRightAddon
                p={0}
                children={
                  <IconButton
                    aria-label={
                      index + 1 === 1
                        ? "Supprimer la 1ère adresse e-mail"
                        : `Supprimer la ${index + 1}ème adresse e-mail`
                    }
                    icon={<DeleteIcon />}
                    bg="transparent"
                    _hover={{ bg: "transparent", color: "red" }}
                    onClick={() => {
                      remove(index);

                      if (fields.length === 1) setValue && setValue(name, null);
                    }}
                  />
                }
              />
            </InputGroup>
            <FormErrorMessage>
              <ErrorMessage errors={errors} name={`${name}[${index}].email`} />
            </FormErrorMessage>
          </FormControl>
        );
      })}

      <Link
        fontSize="smaller"
        onClick={() => {
          append({ email: "" });
        }}
      >
        <AtSignIcon mr={1} /> Ajouter une adresse e-mail{" "}
        {fields.length > 0 && "supplémentaire"}
      </Link>
    </Box>
  );
};
