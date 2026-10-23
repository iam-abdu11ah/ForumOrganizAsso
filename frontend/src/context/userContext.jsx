//to keep track the current user (once logged in)

import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null ou { userId, login, firstName, lastName, isAdmin, isMember, avatarUrl }

  // true tant qu'on ne sait pas encore si une session existe déjà (au chargement de la page)
  const [loading, setLoading] = useState(true);

  // au démarrage, on récupère la session existante pour ne pas être déconnecté au rafraîchissement
  useEffect(() => {
    api.get('/user/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = (userInfo) => setUser(userInfo);    //à appeler après un login réussi

  const logout = () => api.post('/user/logout').then(() => setUser(null));

  // met à jour une partie des infos de l'utilisateur (ex : après modification du profil)
  const updateUser = (changes) => setUser(prev => ({ ...prev, ...changes }));

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};


// hook personalisé pour accéder le contexte facilement
export const useUser = () => useContext(UserContext);
