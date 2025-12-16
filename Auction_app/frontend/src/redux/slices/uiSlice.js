import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notification: { type: '', message: '', show: false },
  modal: { type: '', show: false, data: null }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.notification = { ...action.payload, show: true };
    },
    hideNotification: (state) => {
      state.notification.show = false;
    },
    showModal: (state, action) => {
      state.modal = { ...action.payload, show: true };
    },
    closeModal: (state) => {
      state.modal.show = false;
    }
  }
});

export const { showNotification, hideNotification, showModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;