import { createSlice, Slice } from '@reduxjs/toolkit';

import { IReduxLogout } from '../interfaces/auth.interface';

const initialValue = true;

const logoutSlice: Slice = createSlice({
  name: 'logout',
  initialState: initialValue,
  reducers: {
    updateLogout: (state: boolean, action: IReduxLogout): boolean => {
      state = action.payload;
      return state;
    },
    logout: (): boolean => {
      return true;
    }
  }
});

export const { updateLogout, logout } = logoutSlice.actions;
export default logoutSlice.reducer;
