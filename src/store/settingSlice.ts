import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { AppState } from "store";

type SettingState = {
  [key: string]: string;
};

const initialState: SettingState = {};

export const settingSlice = createSlice({
  name: "setting",
  initialState,
  reducers: {
    setSetting: (
      state,
      action: PayloadAction<{ settingName: string; settingValue: string }>
    ) => {
      state[action.payload.settingName] = action.payload.settingValue;
    }
  }
});

export const { setSetting } = settingSlice.actions;

export const selectSetting = (settingName: string) => (state: AppState) =>
  state.setting[settingName];

export default settingSlice.reducer;
