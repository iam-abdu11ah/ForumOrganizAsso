// instance axios unique : toutes les requêtes vers le backend passent par ici
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// message d'erreur à afficher, même si le serveur n'a pas répondu (serveur éteint, pas de réseau...)
export function getErrorMessage(error) {
  return error.response?.data?.message || "Erreur : impossible de contacter le serveur";
}

export default api;
