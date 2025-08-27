import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// this script creates a pre-configured Axios instance that automatically attatches JWT auth token to every API request
// axios already has CRUD methods built in

// base Axios object
const api = axios.create({
  // load .env variables
  baseURL: import.meta.env.VITE_API_URL,
});

// run before any API request
// gets ACCESS Token from browser's local storage, if it exist, automatically add the Authorization header with the token, then allow request to continue
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
