import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { loginUser, logoutUser, registerUser } from '../authAction';
import { Timestamp } from '@react-native-firebase/firestore';
interface User {
  email: string;
  uid: string;
  username: string;
  DateBitrhDay?: any;
  url?: string;
  friends?: string[];
  createAt?: string;
  userId?: string;
  TwoFA?: boolean;
}
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
  loading: false,
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Xử lý đăng nhập
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload as null;
      })

      // Xử lý đăng ký
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload as null;
      })
      // Xử lý đăng xuất
      .addCase(logoutUser.pending, state => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as null; // Lưu lỗi nếu có lỗi khi đăng xuất
      });
  },
});

export default authSlice.reducer;
