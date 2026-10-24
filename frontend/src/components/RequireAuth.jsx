import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/userContext.jsx";
import ServerWaking from "./ServerWaking.jsx";

// protège les routes enfants : redirige vers /login si personne n'est connecté
export function RequireAuth() {
    const { user, loading } = useUser();

    if (loading) return <ServerWaking />;
    if (!user) return <Navigate to="/login" replace />;
    return <Outlet />;
}

// protège une page réservée aux administrateurs
export function RequireAdmin({ children }) {
    const { user } = useUser();
    return user.isAdmin ? children : <Navigate to="/" replace />;
}
