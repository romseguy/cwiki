import { useCallback, useEffect } from "react";
import {
  FieldName,
  FieldValues,
  SetFieldValue,
  UseFormMethods
} from "react-hook-form";
import { isServer } from "utils/isServer";

function isRecord(arg: unknown): arg is Record<string, unknown> {
  return arg !== null && typeof arg === "object";
}

function parseFromJson(data: string): unknown {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(e);
    return {};
  }
}

/**
 * Custom hook for React Hook Form to persist state to storage.
 *
 * @param option.storage Where to store persistent data. default is "localStorage".
 * @return UseFormReturn.
 */
export default function useFormPersist<T extends FieldValues>(
  useFormReturn: UseFormMethods<T>,
  optionalStorage?: Storage
): UseFormMethods<T> {
  const { watch, setValue } = useFormReturn;

  const inputted = watch();

  const getKey = () => window.location.pathname;
  const getStorage = useCallback(
    () => optionalStorage ?? window.localStorage,
    [optionalStorage]
  );

  // Retrieve data from a storage and set them to a form
  useEffect(() => {
    if (isServer()) {
      return;
    }
    const storaged = getStorage().getItem(getKey());
    if (storaged === null) {
      return;
    }
    const parsed = parseFromJson(storaged);
    if (isRecord(parsed)) {
      Object.entries(parsed).forEach(([k, v]) => {
        setValue(k as FieldName<T>, v as SetFieldValue<T>);
      });
    }
  }, [getStorage, setValue]);

  // Retrieve data from a form and set them to a storage
  useEffect(() => {
    if (isServer()) {
      return;
    }
    const stringified = JSON.stringify(inputted);
    getStorage().setItem(getKey(), stringified);
  }, [getStorage, inputted]);

  // Delete data in a storage when a component is unmounted
  useEffect(() => {
    if (isServer()) {
      return;
    }
    const key = getKey();
    return () => {
      getStorage().removeItem(key);
    };
  }, [getStorage]);

  return useFormReturn;
}
