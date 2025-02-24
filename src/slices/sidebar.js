import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: false,
};

const slice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openSidebar(state) {
      state.sidebarOpen = true;
    },
    closeSidebar(state) {
      state.sidebarOpen = false;
    },
  },
});

export const { reducer } = slice;

export const toggleSidebar = () => async (dispatch) => {
  dispatch(slice.actions.toggleSidebar());
};

export const openSidebar = () => async (dispatch) => {
  dispatch(slice.actions.openSidebar());
};

export const closeSidebar = () => async (dispatch) => {
  dispatch(slice.actions.closeSidebar());
};