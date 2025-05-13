import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "store";
import { setIsOffline } from "store/sessionSlice";
import {
  selectIsMobile,
  selectScreenHeight,
  selectScreenWidth,
  setScreenHeight,
  setScreenWidth
} from "store/uiSlice";
import api from "utils/api";

const controller = new AbortController();
const signal = controller.signal;

export const GlobalConfig = ({}: {}) => {
  const dispatch = useAppDispatch();
  const isMobile = useSelector(selectIsMobile);
  const router = useRouter();
  const screenHeight = useSelector(selectScreenHeight);
  const screenWidth = useSelector(selectScreenWidth);

  useEffect(() => {
    //if (!session) dispatch(setIsSessionLoading(true));

    (async function checkOnlineStatus() {
      const res = await api.get("check", undefined, {
        isLoggingDisabled: true
      });
      if (res.status === 504) dispatch(setIsOffline(true));
    })();

    window.addEventListener("offline", () => {
      dispatch(setIsOffline(true));
    });

    window.addEventListener("online", () => {
      dispatch(setIsOffline(false));
    });

    const updateScreenDimensions = () => {
      const newScreenHeight = window.innerHeight;
      const newScreenWidth = window.innerWidth - 15;
      if (newScreenHeight !== screenHeight)
        dispatch(setScreenHeight(newScreenHeight));
      if (newScreenWidth !== screenWidth)
        dispatch(setScreenWidth(newScreenWidth));
    };

    if (!isMobile) {
      updateScreenDimensions();
      window.addEventListener("resize", updateScreenDimensions);
      signal.addEventListener("abort", () => {
        window.removeEventListener("resize", updateScreenDimensions);
      });
    }

    return () => {
      if (!isMobile) controller.abort();
    };
  }, [router.asPath]);

  return null;
};
