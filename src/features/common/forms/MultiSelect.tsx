import React, { useRef } from "react";
import ReactSelect, { ActionMeta, MultiValue, Props } from "react-select";

export const MultiSelect = ({
  value,
  options,
  allOptionLabel = "Tous",
  onChange,
  ...props
}: Props & {
  value: any;
  options: MultiValue<any>;
  allOptionLabel?: string;
  onChange: (newValue: MultiValue<any>, meta: ActionMeta<any>) => void;
}) => {
  // isOptionSelected sees previous value after onChange
  const valueRef = useRef(value);
  valueRef.current = value;

  const selectAllOption = {
    value: "<SELECT_ALL>",
    label: allOptionLabel
  };

  const isSelectAllSelected = () => valueRef.current.length === options.length;

  const isOptionSelected = (option: any) =>
    valueRef.current.some(
      ({ value }: { value: any }) => value === option.value
    ) || isSelectAllSelected();

  const getOptions = () => [selectAllOption, ...options];

  const getValue = () => (isSelectAllSelected() ? [selectAllOption] : value);

  return (
    <ReactSelect
      isOptionSelected={isOptionSelected}
      options={getOptions()}
      value={getValue()}
      onChange={(newValue, actionMeta) => {
        const { action, option, removedValue } = actionMeta;

        if (actionMeta.option) {
          if (
            action === "select-option" &&
            option.value === selectAllOption.value
          ) {
            onChange(options, actionMeta);
          } else if (
            (action === "deselect-option" &&
              option.value === selectAllOption.value) ||
            (action === "remove-value" &&
              removedValue.value === selectAllOption.value)
          ) {
            onChange([], actionMeta);
          } else if (action === "deselect-option" && isSelectAllSelected()) {
            onChange(
              options.filter(({ value }) => value !== option.value),
              actionMeta
            );
          } else {
            onChange(newValue || [], actionMeta);
          }
        } else onChange(newValue || [], actionMeta);
      }}
      isMulti
      {...props}
    />
  );
};
