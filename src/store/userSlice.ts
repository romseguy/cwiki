import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import { AppState } from "store";

type UserState = {
  userEmail: string;
};

const initialState: UserState = { userEmail: "" };

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserEmail: (state) => {
      state.userEmail = initialState.userEmail;
    },
    setUserEmail: (state, action: PayloadAction<string>) => {
      state.userEmail = action.payload;
    }
  },
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.user
      };
    }
  }
});

export const { resetUserEmail, setUserEmail } = userSlice.actions;

export const selectUserEmail = (state: AppState) => state.user.userEmail;

export default userSlice.reducer;
