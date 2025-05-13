import { useEffect, useState } from "react";

// waits until the DOM element appear
export const useGetElementAsync = (query: string) => {
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    (async () => {
      let element = await new Promise<Element | null>((resolve) => {
        function getElement() {
          const element = document.querySelector(query);
          if (element) {
            resolve(element);
          } else {
            console.count();
            // Set timeout isn't a must but it
            // decreases number of recursions
            setTimeout(() => {
              requestAnimationFrame(getElement);
            }, 100);
          }
        }

        getElement();
      });

      setElement(element);
    })();
  }, [query]);

  return element;
};
