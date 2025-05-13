import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { FormState } from "react-hook-form";

type Props<T> = {
  formState: FormState<T>;
  message?: string;
};

const defaultMessage =
  "Le formulaire a été modifié, êtes-vous sûr de vouloir quitter ?";

export function useLeaveConfirm<T>({
  formState,
  message = defaultMessage
}: Props<T>) {
  const router = useRouter();
  const shouldWarn =
    formState.isDirty && !formState.isSubmitting && !formState.isSubmitted;
  const lastHistoryState = useRef(global.history?.state);

  useEffect(() => {
    const storeLastHistoryState = () => {
      lastHistoryState.current = history.state;
    };
    router.events.on("routeChangeComplete", storeLastHistoryState);
    return () => {
      router.events.off("routeChangeComplete", storeLastHistoryState);
    };
  }, []);

  useEffect(() => {
    let isWarned = false;

    const routeChangeStart = (url: string) => {
      // console.log(
      //   "useLeaveConfirm: routeChangeStart",
      //   router.asPath,
      //   url,
      //   shouldWarn,
      //   isWarned
      // );

      if (router.asPath !== url && shouldWarn && !isWarned) {
        isWarned = true;
        if (window.confirm(message)) {
          router.push(url);
        } else {
          isWarned = false;
          //router.events.emit("routeChangeError");

          // HACK
          const state = lastHistoryState.current;
          if (
            state != null &&
            history.state != null &&
            state.idx !== history.state.idx
          ) {
            history.go(state.idx < history.state.idx ? -1 : 1);
          }

          throw "Abort route change. Please ignore this error.";
        }
      }
    };

    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldWarn && !isWarned) {
        const event = e || window.event;
        event.returnValue = message;
        return message;
      }
      return null;
    };

    router.events.on("routeChangeStart", routeChangeStart);
    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      router.events.off("routeChangeStart", routeChangeStart);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [message, shouldWarn]);
}

{
  /*
    import { useRouter } from "next/router";
    import { useCallback, useEffect } from "react";

    const defaultMessage = "Le formulaire a été modifié, êtes-vous sûr de vouloir quitter ?";

    export function useLeaveConfirm<T>({
      formState,
      message = defaultMessage
    }: Props<T>) {
      const router = useRouter();

      const confirmLeave = useCallback(() => {
        if (formState.isDirty) {
          if (window.confirm(message)) {
            return true;
          }
          throw "Abort route change by user's confirmation.";
        }
      }, [formState]);

      const handleWindowClose = useCallback((e) => {
        e.preventDefault();
        return (e.returnValue = defaultMessage);
      }, []);

      useEffect(() => {
        window.addEventListener("beforeunload", handleWindowClose);

        return () => {
          window.removeEventListener("beforeunload", handleWindowClose);
        };
      }, []);

      useEffect(() => {
        //window.addEventListener("beforeunload", handleWindowClose);
        router.events.on("routeChangeStart", confirmLeave);

        return () => {
          //window.removeEventListener("beforeunload", handleWindowClose);
          router.events.off("routeChangeStart", confirmLeave);
        };
      }, [confirmLeave]);

      return;
    }
  */
}
