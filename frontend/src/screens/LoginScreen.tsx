import React from 'react';
import AuthScreen, { AuthScreenProps } from './AuthScreen';

const LoginScreen: React.FC<AuthScreenProps> = (props) => {
  return <AuthScreen {...props} />;
};

export default LoginScreen;
