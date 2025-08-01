import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  userType: 'parent' | 'sitter' | 'admin';
  profileImageUrl?: string;
  isVerified: boolean;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: 'parent' | 'sitter' | null;
  authToken: string | null;
  refreshToken: string | null;
  isOnboardingComplete: boolean;
  emergencyContacts: string[];
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  userType: null,
  authToken: null,
  refreshToken: null,
  isOnboardingComplete: false,
  emergencyContacts: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.userType = action.payload.userType;
    },
    setUserType: (state, action: PayloadAction<'parent' | 'sitter'>) => {
      state.userType = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthToken: (state, action: PayloadAction<string>) => {
      state.authToken = action.payload;
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload;
    },
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingComplete = action.payload;
    },
    setEmergencyContacts: (state, action: PayloadAction<string[]>) => {
      state.emergencyContacts = action.payload;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.userType = null;
      state.authToken = null;
      state.refreshToken = null;
      state.isOnboardingComplete = false;
      state.emergencyContacts = [];
    },
    clearAuthData: (state) => {
      state.authToken = null;
      state.refreshToken = null;
    },
  },
});

export const {
  setUser,
  setUserType,
  setLoading,
  setAuthToken,
  setRefreshToken,
  setOnboardingComplete,
  setEmergencyContacts,
  updateUserProfile,
  logout,
  clearAuthData,
} = authSlice.actions;

export default authSlice.reducer; 