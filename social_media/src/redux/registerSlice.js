import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  formData: {
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    otp: null, // Changed to null to handle both string and number
    otpExpiryTime: null, // Added missing field
  },
};

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    setRegisterFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setOtp: (state, action) => {
      state.formData.otp = action.payload;
    },
    resetRegisterForm: (state) => {
      state.formData = initialState.formData;
    },
   
  },
});

export const { setRegisterFormData, setOtp, resetRegisterForm } = registerSlice.actions;
export default registerSlice.reducer;
