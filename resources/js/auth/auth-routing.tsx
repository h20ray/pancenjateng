import { Route, Routes } from 'react-router-dom';
import { SignInPage } from './pages/signin-page';

export function AuthRouting() {
  return (
    <Routes>
      <Route path="signin" element={<SignInPage />} />
    </Routes>
  );
}
