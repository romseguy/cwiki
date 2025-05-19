import { TimeIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { styled } from "@emotion/react";
import { fr } from "date-fns/locale";
import React, { forwardRef, Ref } from "react";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";
import { isBrowser } from "react-device-detect";
import "react-datepicker/dist/react-datepicker.min.css";
import { format, parseISO } from "date-fns";

const ReactDatePickerStyles = styled.span(
  ({ isBrowser }: { isBrowser: boolean }) => [
    `
    .react-datepicker {
    }
    
    .react-datepicker__time-list-item--disabled {
      display: none;
    }

    .react-datepicker__day {
      //width: 24px !important;
      margin: unset;
    }
    .react-datepicker__day-name {
      //width: 24px !important;
      margin: unset;
    }

    .react-datepicker__month-container {
      width: 250px !important;
    }
    .react-datepicker__month {
      margin: unset;
    }

    .react-datepicker__time-container {
      width: unset !important;
    }
    .react-datepicker__time-container
      .react-datepicker__time
      .react-datepicker__time-box {
      width: unset;
    }
    // ul.react-datepicker__time-list > li {
    //   padding: unset !important;
    // }
  `,
    isBrowser &&
      `
      .react-datepicker-popper {
        z-index: 100 !important;
      }
      /* remove default previous/next icons */
        .react-datepicker__navigation-icon--previous:before {
          border: 0 !important;
        }
        .react-datepicker__navigation-icon--next:before {
          border: 0 !important;
        }
      /* use custom */
        .react-datepicker__navigation--next {
          background: url(/images/arrow-right.png) no-repeat;
        }
        .react-datepicker__navigation--previous {
          background: url(/images/arrow-left.png) no-repeat;
        }
        .react-datepicker__navigation--previous,
        .react-datepicker__navigation--next {
          width: 15px;
          height: 15px;
          border: none;
          top: 12px;
        }
      `
  ]
);

export const renderCustomInput = ({
  label,
  isTimeOnly = false
}: {
  label: string;
  isTimeOnly?: boolean;
}) => {
  const ExampleCustomInput = forwardRef(
    (
      { value, onClick }: { value?: string; onClick?: () => void },
      ref: Ref<HTMLButtonElement>
    ) => {
      let cursor = "pointer";
      let isDisabled = false;

      const day = value?.substr(0, 2);
      const month = value?.substr(3, 2);
      const year = value?.substr(6, 4);
      const hours = value?.substr(12, 2);
      const minutes = value?.substr(15, 2);
      const date = parseISO(`${year}-${month}-${day}T${hours}:${minutes}`);

      // if (
      //   label === "repeat" &&
      //   (!eventMinDate || !eventMaxDate)
      // ) {
      //   cursor = "not-allowed";
      //   isDisabled = true;
      // }

      return (
        <Button
          aria-label={label}
          onClick={onClick}
          ref={ref}
          isDisabled={isDisabled}
        >
          {value ? (
            format(date, isTimeOnly ? "H'h'mm" : "cccc d MMMM H'h'mm", {
              locale: fr
            })
          ) : (
            <TimeIcon cursor={cursor} />
          )}
        </Button>
      );
    }
  );
  return <ExampleCustomInput />;
};

export const DatePicker = ({ ...datePickerProps }: ReactDatePickerProps) => {
  // let selected = datePickerProps.selected;

  // if (selected === null) {
  //   selected = new Date();
  // }

  return (
    <ReactDatePickerStyles isBrowser={isBrowser}>
      <ReactDatePicker
        dateFormat="dd/MM"
        locale={fr}
        //selected={selected}
        timeCaption="h"
        onChangeRaw={(e) => e.preventDefault()}
        {...datePickerProps}
      />
    </ReactDatePickerStyles>
  );
};
