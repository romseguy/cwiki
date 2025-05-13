import { AtSignIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  CSSObject,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  InputRightAddon,
  Select,
  SpaceProps
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { ErrorMessage } from "@hookform/error-message";
import React, { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { FaGlobeEurope } from "react-icons/fa";

import { optionalProtocolUrlR, urlR } from "utils/url";
import { Link } from "../Link";

export type UrlControlValue = { url: string; prefix: string }[] | null;

export const UrlControl = ({
  label = "Site internet",
  placeholder = "Saisir une adresse internet",
  defaultValue,
  errors,
  name,
  control,
  register,
  setValue,
  containerProps = {},
  isRequired = false,
  isMultiple = true,
  ...props
}: SpaceProps & {
  label?: string;
  defaultValue?: string;
  errors: any;
  name: string;
  control: any;
  register: any;
  setValue: (name: string, value: UrlControlValue | string) => void;
  containerProps?: CSSObject;
  isRequired?: boolean;
  placeholder?: string;
  isMultiple?: boolean;
}) => {
  let formRules: { required?: string | boolean } = {};

  if (isRequired) {
    formRules.required = "Veuillez saisir une adresse internet";
  }

  if (!isMultiple) {
    return (
      <FormControl isRequired={isRequired} isInvalid={!!errors[name]}>
        <FormLabel>{label || "Site internet"}</FormLabel>

        <InputGroup>
          <InputLeftElement pointerEvents="none" children={<AtSignIcon />} />
          <Input
            name={name}
            placeholder={placeholder}
            ref={register({
              pattern: {
                value: urlR,
                message: "Adresse invalide"
              },
              ...formRules
            })}
            defaultValue={defaultValue}
            pl={10}
            {...props}
          />
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
            isInvalid={!!(errors[name] && errors[name][index])}
            {...props}
          >
            <FormLabel m={0}>
              {index > 0 ? `${index + 1}ème ${label.toLowerCase()}` : label}
            </FormLabel>

            <InputGroup>
              <InputLeftAddon
                bg="transparent"
                border={0}
                p={0}
                children={
                  <Select
                    name={`${name}[${index}].prefix`}
                    ref={register()}
                    defaultValue={field.prefix}
                    variant="filled"
                    borderTopRightRadius={0}
                    borderBottomRightRadius={0}
                    css={css`
                      margin: 0 !important;
                    `}
                    onChange={(e) =>
                      setValue(`${name}[${index}].prefix`, e.target.value)
                    }
                  >
                    <option value="https://">https://</option>
                    <option value="http://">http://</option>
                  </Select>
                }
              />
              <Input
                name={`${name}[${index}].url`}
                placeholder={placeholder}
                defaultValue={field.url}
                ref={register({
                  pattern: {
                    value: optionalProtocolUrlR,
                    message: "Adresse invalide"
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
                        ? "Supprimer la 1ère adresse de site internet"
                        : `Supprimer la ${
                            index + 1
                          }ème adresse de site internet`
                    }
                    icon={<DeleteIcon />}
                    bg="transparent"
                    _hover={{ bg: "transparent", color: "red" }}
                    onClick={() => {
                      remove(index);

                      if (fields.length === 1) setValue(name, null);
                    }}
                  />
                }
              />
            </InputGroup>
            <FormErrorMessage>
              <ErrorMessage errors={errors} name={`${name}[${index}].url`} />
            </FormErrorMessage>
          </FormControl>
        );
      })}

      <Link
        fontSize="smaller"
        onClick={() => {
          append({ url: "", prefix: "https://" });
        }}
      >
        <Icon as={FaGlobeEurope} mr={1} /> Ajouter un site internet{" "}
        {fields.length > 0 && "supplémentaire"}
      </Link>
    </Box>
  );
};
