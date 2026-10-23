import '../css/App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from '../context/userContext.jsx'
import { RequireAuth, RequireAdmin } from './RequireAuth.jsx'
import Auth from './Auth.jsx'
import MainPage from "./MainPage.jsx"
import Forum from './Forum.jsx'
import AccountPage from './AccountPage.jsx'
import Profile from './Profile.jsx'

// root of the componant tree : l'URL décide quelle page est affichée
function App() {

  const { user } = useUser();

  return (
    <BrowserRouter>
      <Routes>
        {/* key : la page repart de zéro (champs, messages) quand on passe de l'une à l'autre */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth key="login" mode="login" />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Auth key="signup" mode="signup" />} />

        {/* pages accessibles uniquement une fois connecté */}
        <Route element={<RequireAuth />}>
          <Route element={<MainPage />}>
            <Route index element={<Forum isPrivate={false} />} />
            <Route path="private" element={<RequireAdmin><Forum isPrivate={true} /></RequireAdmin>} />
            <Route path="users" element={<AccountPage />} />
            <Route path="profile/:userId" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
