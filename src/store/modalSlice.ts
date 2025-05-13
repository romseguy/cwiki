import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { AppState } from "./";

type ModalState = {
  isContactModalOpen: boolean;
};

const initialState: ModalState = {
  isContactModalOpen: false
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setIsContactModalOpen: (state, action: PayloadAction<boolean>) => {
      if (!action.payload)
        state.isContactModalOpen = initialState.isContactModalOpen;
      state.isContactModalOpen = action.payload;
    }
  }
});

export const { setIsContactModalOpen } = modalSlice.actions;

export const selectIsContactModalOpen = (state: AppState) =>
  state.modal.isContactModalOpen;

export default modalSlice.reducer;
