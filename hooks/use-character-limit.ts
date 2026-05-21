"use client";

import { useCallback, useState } from "react";

type UseCharacterLimitOptions = {
  maxLength?: number;
  initialValue?: string;
};

export function useCharacterLimit(options: UseCharacterLimitOptions | number = {}) {
  const config =
    typeof options === "number"
      ? { maxLength: options, initialValue: "" }
      : options;

  const maxLength = config.maxLength ?? 500;
  const [value, setValue] = useState(config.initialValue ?? "");

  const characterCount = value.length;
  const remainingCount = Math.max(maxLength - characterCount, 0);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | string) => {
      const nextValue = typeof event === "string" ? event : event.target.value;

      if (nextValue.length <= maxLength) {
        setValue(nextValue);
      } else {
        setValue(nextValue.slice(0, maxLength));
      }
    },
    [maxLength]
  );

  return {
    value,
    setValue,
    maxLength,
    characterCount,
    remainingCount,
    charactersLeft: remainingCount,
    handleChange,
    onChange: handleChange,
  };
}
