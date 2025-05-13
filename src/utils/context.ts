import { PayloadAction } from "@reduxjs/toolkit";
import {
  ReactNode,
  createContext,
  createElement,
  useContext,
  useReducer
} from "react";

interface AppState {
  isMobile: boolean;
}

const AppStateContext = createContext<
  | {
      state: AppState;
      dispatch: (action: PayloadAction<any>) => void;
    }
  | undefined
>(undefined);

function appReducer(state: AppState, action: PayloadAction<boolean>) {
  switch (action.type) {
    case "setIsMobile": {
      return { isMobile: action.payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function AppStateProvider({
  children,
  isMobile
}: {
  children: ReactNode;
  isMobile: boolean;
}) {
  const [state, dispatch] = useReducer(appReducer, { isMobile });

  return createElement(AppStateContext.Provider, {
    children,
    value: { state, dispatch }
  });
}

const useAppState = () => {
  const context = useContext(AppStateContext);

  if (context === undefined) {
    throw new Error("useAppState must be used within a AppStateProvider");
  }

  return context;
};

export { AppStateProvider, useAppState };
