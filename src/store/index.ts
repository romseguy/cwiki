import { ThunkAction, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { api } from "features/api";
import { settingApi } from "features/api/settingsApi";
import { createWrapper } from "next-redux-wrapper";
import { useDispatch } from "react-redux";
import { Action } from "redux";
import { getEnv } from "utils/env";
import modal from "./modalSlice";
import session from "./sessionSlice";
import setting from "./settingSlice";
import ui from "./uiSlice";
import user from "./userSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      modal,
      session,
      setting,
      ui,
      user,
      [api.reducerPath]: api.reducer,
      [settingApi.reducerPath]: settingApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat([
        api.middleware,
        settingApi.middleware
      ]),
    devTools: getEnv() !== "production"
  });

export const store = makeStore();

setupListeners(store.dispatch);

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const wrapper = createWrapper<AppStore>(makeStore, { debug: false });
