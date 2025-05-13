import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import { AppState } from "store";

export const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isMobile: false,
    rteditorIndex: 0,
    screenHeight: 0,
    screenWidth: 0
  },

  reducers: {
    incrementRTEditorIndex: (state, action: PayloadAction<undefined>) => {
      state.rteditorIndex++;
    },
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
    },
    setScreenHeight: (state, action: PayloadAction<number>) => {
      state.screenHeight = action.payload;
    },
    setScreenWidth: (state, action: PayloadAction<number>) => {
      state.screenWidth = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder.addCase(
      HYDRATE,
      (
        state,
        action: PayloadAction<{ ui: typeof uiSlice }, typeof HYDRATE>
      ) => {
        return {
          ...state,
          ...action.payload.ui
        };
      }
    );
  }
});

export const {
  incrementRTEditorIndex,
  setIsMobile,
  setScreenHeight,
  setScreenWidth
} = uiSlice.actions;
export const selectRTEditorIndex = (state: AppState) => state.ui.rteditorIndex;
export const selectIsMobile = (state: AppState) => state.ui.isMobile;
export const selectScreenHeight = (state: AppState) => state.ui.screenHeight;
export const selectScreenWidth = (state: AppState) => state.ui.screenWidth;

export default uiSlice.reducer;
