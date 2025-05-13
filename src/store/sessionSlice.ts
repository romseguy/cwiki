import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import { AppState } from "store";
import { Session } from "utils/auth";

const initialState: {
  isOffline: boolean;
  isSessionLoading: boolean;
  session: Session | null;
} = {
  isOffline: false,
  isSessionLoading: false,
  session: null
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setIsOffline: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    setIsSessionLoading: (state, action: PayloadAction<boolean>) => {
      state.isSessionLoading = action.payload;
    },
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
    }
  },
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.session
      };
    }
  }
});

export const { setIsOffline, setIsSessionLoading, setSession } =
  sessionSlice.actions;

export const selectIsOffline = (state: AppState) => state.session.isOffline;
export const selectIsSessionLoading = (state: AppState) =>
  state.session.isSessionLoading;
export const selectSession = (state: AppState) => state.session.session;

export default sessionSlice.reducer;
