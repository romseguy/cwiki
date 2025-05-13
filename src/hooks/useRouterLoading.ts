import Router from "next/router";
import { useEffect, useState } from "react";

export const useRouterLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(new Error());

  useEffect(() => {
    const start = () => setIsLoading(true);
    const complete = () => {
      setIsLoading(false);
      setIsError(false);
    };
    const error = (error: Error) => {
      setIsLoading(false);
      setIsError(true);
      setError(error);
    };
    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", complete);
    Router.events.on("routeChangeError", error);
    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", complete);
      Router.events.off("routeChangeError", error);
    };
  }, []);

  return { isLoading, isError, error };
};
