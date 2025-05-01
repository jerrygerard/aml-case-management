declare module '*.tsx' {
  import { FC } from 'react';
  const component: FC;
  export default component;
}

declare module './layouts/AuthLayout' {
  import { FC } from 'react';
  const AuthLayout: FC;
  export default AuthLayout;
}

declare module './layouts/MainLayout' {
  import { FC } from 'react';
  const MainLayout: FC;
  export default MainLayout;
}

declare module './pages/Login' {
  import { FC } from 'react';
  const Login: FC;
  export default Login;
}

declare module './pages/Register' {
  import { FC } from 'react';
  const Register: FC;
  export default Register;
}

declare module './pages/Dashboard' {
  import { FC } from 'react';
  const Dashboard: FC;
  export default Dashboard;
}

declare module './pages/cases/Cases' {
  import { FC } from 'react';
  const Cases: FC;
  export default Cases;
}

declare module './pages/cases/CaseDetails' {
  import { FC } from 'react';
  const CaseDetails: FC;
  export default CaseDetails;
}

declare module './pages/Profile' {
  import { FC } from 'react';
  const Profile: FC;
  export default Profile;
} 