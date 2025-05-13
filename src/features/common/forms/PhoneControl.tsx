// import { Input } from "features/common";
import { AtSignIcon, DeleteIcon, PhoneIcon } from "@chakra-ui/icons";
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
  InputLeftElement,
  InputRightAddon,
  InputRightElement,
  SpaceProps
} from "@chakra-ui/react";
import { ErrorMessage } from "@hookform/error-message";
import React from "react";
import { useFieldArray } from "react-hook-form";
import { phoneR } from "utils/string";
import { Link } from "../Link";

type PhoneControlValue = [{ address: string }] | null;

export const PhoneControl = ({
  defaultValue = "",
  errors,
  name,
  label = "Numéro de téléphone",
  noLabel,
  control,
  register,
  setValue,
  containerProps = {},
  isRequired = false,
  isMultiple = true,
  placeholder = "Saisir un numéro de téléphone...",
  ...props
}: SpaceProps & {
  defaultValue?: string;
  errors: any;
  name: string;
  label?: string;
  noLabel?: boolean;
  control: any;
  register: any;
  setValue: (name: string, value: PhoneControlValue) => void;
  containerProps?: CSSObject;
  isRequired?: boolean;
  placeholder?: string;
  isMultiple?: boolean;
}) => {
  let formRules: { required?: string | boolean } = {};

  if (isRequired) {
    formRules.required = "Veuillez saisir un numéro de téléphone";
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
          <InputLeftElement pointerEvents="none" children={<PhoneIcon />} />
          <Input
            type="tel"
            name={name}
            placeholder={placeholder}
            defaultValue={defaultValue}
            ref={register({
              pattern: {
                value: phoneR,
                message: "Numéro de téléphone invalide"
              },
              ...formRules
            })}
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
            isInvalid={errors[name] && errors[name][index]}
            {...props}
          >
            {!noLabel && (
              <FormLabel m={0}>
                {index > 0 ? `${index + 1}ème ${label.toLowerCase()}` : label}
              </FormLabel>
            )}
            <InputGroup>
              <InputLeftElement pointerEvents="none" children={<PhoneIcon />} />
              <Input
                name={`${name}[${index}].phone`}
                placeholder={placeholder}
                defaultValue={`${field.phone}`} // make sure to set up defaultValue
                ref={register({
                  pattern: {
                    value: phoneR,
                    message: "Numéro de téléphone invalide"
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
                        ? "Supprimer le 1er numéro de téléphone"
                        : `Supprimer le ${index + 1}ème numéro de téléphone`
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
              <ErrorMessage errors={errors} name={`${name}[${index}].phone`} />
            </FormErrorMessage>
          </FormControl>
        );
      })}

      <Link
        fontSize="smaller"
        onClick={() => {
          append({ phone: "" });
        }}
      >
        <PhoneIcon mr={1} /> Ajouter un numéro de téléphone{" "}
        {fields.length > 0 && "supplémentaire"}
      </Link>
    </Box>
  );
};
