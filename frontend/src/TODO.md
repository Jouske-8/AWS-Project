# Componentization Task

## Completed
- [x] Create folder structure
- [x] Move StatusBadge to components/common/StatusBadge.jsx
- [x] Move MethodBadge to components/common/MethodBadge.jsx
- [x] Move AuthLayout to components/auth/AuthLayout.jsx
- [x] Move LoginForm to components/auth/LoginForm.jsx
- [x] Move SignupForm to components/auth/SignupForm.jsx
- [x] Move Dashboard to components/dashboard/Dashboard.jsx
- [x] Move cognitoConfig to config/awsConfig.js
- [x] Move mockApiLogs to data/mockData.js
- [x] Update App.jsx to import all components and constants
- [ ] Test the application

# Auth Integration Task

## Completed
- [x] Uncomment Amplify.configure in awsConfig.js
- [x] Update App.jsx: Import Amplify and Auth, configure Amplify, replace mock logic with real Auth methods
- [x] Update LoginForm.jsx: Replace mock login with Auth.signIn
- [x] Update SignupForm.jsx: Replace mock signup with Auth.signIn (using new auth API)
- [x] Update SignupForm.jsx: Replace mock signup with Auth.signUp (using new auth API)

## Pending
- [x] Test sign up and login functionality
- [x] Verify Cognito User Pool settings (allow sign up, password policy)
