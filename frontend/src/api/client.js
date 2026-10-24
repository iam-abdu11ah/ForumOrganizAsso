// instance axios unique : toutes les requêtes vers le backend passent par ici
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  // sans timeout, une requête vers un serveur qui ne répond pas attend indéfiniment
  // 60s : le backend gratuit sur Render met ~50s à se réveiller après une période d'inactivité
  timeout: 60000
});

// message d'erreur à afficher, même si le serveur n'a pas répondu (serveur éteint, pas de réseau...)
export function getErrorMessage(error) {
  return error.response?.data?.message || "Erreur : impossible de contacter le serveur";
}

export default api;
