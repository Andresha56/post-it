import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/layout/AppLayout';
import { AuthRedirect } from './components/orbit-landing/AuthRedirect';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { ContentPage } from './pages/ContentPage';
import { CalendarPage } from './pages/CalendarPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { SocialAccountsPage } from './pages/SocialAccountsPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));

export default function App() {
  return <>
    <Suspense fallback={null}>
    <Routes>
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/signin" element={<AuthRedirect mode="login"/>}/>
      <Route path="/signup" element={<AuthRedirect mode="signup"/>}/>
      <Route path="/verify-email" element={<VerifyEmailPage/>}/>
      <Route element={<ProtectedRoute/>}>
      <Route element={<AppLayout/>}>
        <Route path="dashboard" element={<DashboardPage/>}/>
        <Route path="create" element={<CreatePostPage/>}/>
        <Route path="content" element={<ContentPage/>}/>
        <Route path="content/:id/edit" element={<CreatePostPage/>}/>
        <Route path="calendar" element={<CalendarPage/>}/>
        <Route path="media" element={<PlaceholderPage/>}/>
        <Route path="analytics" element={<PlaceholderPage/>}/>
        <Route path="ai-studio" element={<PlaceholderPage/>}/>
        <Route path="social-accounts" element={<SocialAccountsPage/>}/>
        <Route path="team" element={<PlaceholderPage/>}/>
        <Route path="agent-api" element={<PlaceholderPage/>}/>
        <Route path="settings" element={<PlaceholderPage/>}/>
        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
      </Route>
      </Route>
    </Routes>
    </Suspense>
    <Toaster position="bottom-right" toastOptions={{ duration: 2800 }}/>
  </>;
}
