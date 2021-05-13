import { useRef } from "react";

export const useConstant = <T>(init: () => T): T => {
  const ref = useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = init();
  }

  return ref.current;
};
