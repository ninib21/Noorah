export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Auth: { mode?: 'parent' | 'sitter' } | undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  UserTypeSelection: undefined;
  ProfileSetup: undefined;

  BookingFlow: { sitterId?: string; date?: string; time?: string } | undefined;
  EmergencySOS: undefined;
  SecurityDemo: undefined;

  ParentTabs: undefined;
  SitterTabs: undefined;

  Pricing: undefined;

  NavigationTest: undefined;
  QuickTest: undefined;
  BackendTest: undefined;

  // Direct tab routes pointing to tab navigators
  ParentHome: undefined;
  ParentBook: undefined;
  ParentMySitters: undefined;
  ParentMessages: undefined;
  ParentProfile: undefined;

  SitterHome: undefined;
  SitterJobs: undefined;
  SitterMessages: undefined;
  SitterEarnings: undefined;
  SitterProfile: undefined;
};


