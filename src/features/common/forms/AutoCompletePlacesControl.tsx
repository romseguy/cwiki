import {
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  List,
  ListItem,
  ListProps,
  SpaceProps,
  useColorMode
} from "@chakra-ui/react";
import theme from "features/layout/theme";
import React, { KeyboardEvent, useEffect, useState } from "react";
import useOnclickOutside from "react-cool-onclickoutside";
import { FaMapMarkedAlt } from "react-icons/fa";
import usePlacesAutocomplete, { Suggestion } from "use-places-autocomplete";
import { hasItems } from "utils/array";

let cachedVal = "";
const acceptedKeys = ["ArrowUp", "ArrowDown", "Escape", "Enter"];

export const AutoCompletePlacesControl = ({
  value,
  placeholder,
  rightAddon,
  inputProps,
  suggestionsListProps,
  onChange,
  onSuggestionSelect,
  onClick,
  ...props
}: SpaceProps & {
  value?: string;
  placeholder?: string;
  rightAddon?: React.ReactNode;
  inputProps?: InputProps;
  suggestionsListProps?: ListProps;
  onChange?: (description: string) => void;
  onSuggestionSelect?: (suggestion: Suggestion) => void;
  onClick?: () => void;
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const {
    ready,
    value: autoCompleteValue,
    suggestions: { status, data },
    setValue: setAutoCompleteValue,
    clearSuggestions
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: {
        country: "fr"
      }
    },
    debounce: 300
  });

  const [currIndex, setCurrIndex] = useState<number | null>(null);
  const dismissSuggestions = () => {
    setCurrIndex(null);
    clearSuggestions();
  };
  const hasSuggestions = status === "OK";

  useEffect(() => {
    if (typeof value === "string") {
      setAutoCompleteValue(value, false);
    }
  }, [value]);

  const ref = useOnclickOutside(() => {
    if (hasItems(data) && onSuggestionSelect) {
      onSuggestionSelect(data[0]);
    }
    dismissSuggestions();
  });

  const handleSelect = (suggestion: Suggestion) => () => {
    const description = suggestion.description.replace(", France", "");
    setAutoCompleteValue(description, false);
    onChange && onChange(description);
    onSuggestionSelect && onSuggestionSelect(suggestion);
    dismissSuggestions();
  };

  const renderSuggestions = () =>
    data.map((suggestion: Suggestion, idx: number) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text }
      } = suggestion;
      const isCurrent = idx === currIndex;

      let bg = isDark ? "gray.600" : "white";
      let color = isDark ? "white" : theme.colors.black;

      if (isCurrent) {
        if (isDark) {
          bg = "white";
          color = theme.colors.black;
        } else {
          bg = theme.colors.black;
          color = "white";
        }
      }

      return (
        <ListItem
          key={place_id}
          cursor="pointer"
          bg={bg}
          color={color}
          borderRadius="lg"
          px={3}
          py={2}
          _hover={{ boxShadow: "outline" }}
          onClick={handleSelect(suggestion)}
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </ListItem>
      );
    });

  return (
    <div ref={ref}>
      <InputGroup {...props}>
        <InputLeftElement pointerEvents="none" children={<FaMapMarkedAlt />} />

        <Input
          value={autoCompleteValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setAutoCompleteValue(e.target.value);
            cachedVal = e.target.value;
            onChange && onChange(e.target.value);
          }}
          autoComplete="off"
          placeholder={placeholder}
          pl={10}
          onClick={onClick}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (!hasSuggestions || !acceptedKeys.includes(e.key)) return;

            if (e.key === "Escape") {
              e.preventDefault();
              dismissSuggestions();
              return;
            }

            if (e.key === "Enter") {
              e.preventDefault();
              let description = cachedVal;

              if (currIndex) {
                description = data[currIndex].description.replace(
                  ", France",
                  ""
                );
              }

              setAutoCompleteValue(description, false);
              onChange && onChange(description);
              dismissSuggestions();
              return;
            }

            let nextIndex: number | null;

            if (e.key === "ArrowUp") {
              e.preventDefault();
              nextIndex = currIndex ?? data.length;
              nextIndex = nextIndex > 0 ? nextIndex - 1 : null;
            } else {
              nextIndex = currIndex ?? -1;
              nextIndex = nextIndex < data.length - 1 ? nextIndex + 1 : null;
            }

            setCurrIndex(nextIndex);

            if (nextIndex === null) setAutoCompleteValue(cachedVal);
            else setAutoCompleteValue(data[nextIndex].description, false);
          }}
          {...inputProps}
        />

        {rightAddon}
      </InputGroup>

      {status === "OK" && (
        <List
          className="suggestions"
          spacing={3}
          pt={2}
          px={5}
          {...suggestionsListProps}
        >
          {renderSuggestions()}
        </List>
      )}
    </div>
  );
};
