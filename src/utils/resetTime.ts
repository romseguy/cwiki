import { setHours, setMinutes, setSeconds } from "date-fns";

export const resetTime = (date: Date) =>
  setHours(setMinutes(setSeconds(date, 0), 0), 0);
