import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { ContentPage } from './pages/ContentPage';
import { CalendarPage } from './pages/CalendarPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

export default function App() {
  return <>
    <Routes>
      <Route element={<AppLayout/>}>
        <Route index element={<DashboardPage/>}/>
        <Route path="create" element={<CreatePostPage/>}/>
        <Route path="content" element={<ContentPage/>}/>
        <Route path="calendar" element={<CalendarPage/>}/>
        <Route path="media" element={<PlaceholderPage/>}/>
        <Route path="analytics" element={<PlaceholderPage/>}/>
        <Route path="ai-studio" element={<PlaceholderPage/>}/>
        <Route path="social-accounts" element={<PlaceholderPage/>}/>
        <Route path="team" element={<PlaceholderPage/>}/>
        <Route path="agent-api" element={<PlaceholderPage/>}/>
        <Route path="settings" element={<PlaceholderPage/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Route>
    </Routes>
    <Toaster position="bottom-right" toastOptions={{ duration: 2800 }}/>
  </>;
}
