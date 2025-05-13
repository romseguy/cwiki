import { SmallCloseIcon } from "@chakra-ui/icons";
import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  InputGroup,
  InputRightElement
} from "@chakra-ui/react";
import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteTag,
  ItemTag
} from "@choc-ui/chakra-autocomplete";
import { css } from "@emotion/react";
import { ErrorMessage } from "@hookform/error-message";
import React, { useEffect, useState } from "react";
import {
  Control,
  Controller,
  DeepMap,
  FieldError,
  FieldValues,
  UseFormMethods,
  useWatch
} from "react-hook-form";
import { hasItems } from "utils/array";

export const TagsControl = ({
  control,
  errors,
  setError,
  isRequired = false,
  label,
  leftElement,
  name,
  setTags,
  setValue,
  tags,
  ...props
}: FormControlProps & {
  control: Control<FieldValues>;
  errors: DeepMap<FieldValues, FieldError>;
  setError: UseFormMethods["setError"];
  isRequired?: boolean;
  label?: string;
  leftElement?: React.ReactNode;
  name: string;
  setTags: React.Dispatch<React.SetStateAction<ItemTag[]>>;
  setValue: UseFormMethods["setValue"];
  tags: ItemTag[];
}) => {
  const [tagLabelToRemove, setTagLabelToRemove] = useState("");
  useEffect(() => {
    setTags(tags.filter(({ label }) => label !== tagLabelToRemove));
  }, [tagLabelToRemove]);

  const value = useWatch<string>({ control, name }) || "";
  useEffect(() => {
    if (isRequired && !value && !hasItems(tags)) {
      setError(name, { message: "" });
    } else if (value !== "") {
      const chunks = value
        .split(/(\s+)/)
        .filter((str: string) => str.length > 0);

      if (chunks.length >= 2) {
        let labels: string[] = [];

        for (let i = 0; i < chunks.length; ++i) {
          const chunk = chunks[i];
          if (chunk !== " ") {
            if (
              !!chunks[i + 1] &&
              !labels.includes(chunk) &&
              !tags.find(({ label }) => label === chunk)
            ) {
              labels.push(chunk);
            }
          }
        }

        setValue(
          name,
          chunks.length % 2 === 0 ? "" : chunks[chunks.length - 1]
        );
        setTags(
          tags.concat(
            labels.map((label) => ({
              label,
              onRemove: () => setTagLabelToRemove(label)
            }))
          )
        );
      }
    }
  }, [value]);

  return (
    <FormControl isInvalid={!!errors[name]} isRequired={isRequired} {...props}>
      <FormLabel>{label}</FormLabel>

      <Controller
        name={name}
        control={control}
        render={(renderProps) => {
          return (
            <AutoComplete multiple>
              <InputGroup>
                {leftElement}
                <AutoCompleteInput
                  value={renderProps.value}
                  onChange={renderProps.onChange}
                  css={css`
                    ul {
                      &:first-of-type {
                        padding-left: 16px !important;
                      }

                      & > li > input {
                        padding-left: 0 !important;
                      }
                    }
                  `}
                >
                  {tags.map((tag, tid) => (
                    <AutoCompleteTag
                      key={tid}
                      label={tag.label}
                      onRemove={tag.onRemove}
                    />
                  ))}
                </AutoCompleteInput>
                <InputRightElement
                  cursor="pointer"
                  children={<SmallCloseIcon />}
                  _hover={{ color: "red" }}
                  onClick={() => setTags([])}
                />
              </InputGroup>
            </AutoComplete>
          );
        }}
      />
      <FormErrorMessage>
        <ErrorMessage errors={errors} name={name} />
      </FormErrorMessage>
    </FormControl>
  );
};
