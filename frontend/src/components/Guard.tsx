import {Navigate} from "react-router-dom"
import {jwtDecode, type JwtPayload} from "jwt-decode"
import api from "../api"
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants"
import { useState, useEffect, type ReactNode } from "react"


// this script acts as a guard for the application's routes, check ig user is authenticated before allowing access to page
// first assume does not know whether user is authorized, show loading message
// look for access token in browser's local storage, if yes, decode expiration time
// if token is expired, request a new one using refreshToken by requesting from backend
// if all success, allow access, else redirect to login page
interface ProtectedRouteProps {
  children: ReactNode;
}


const ProtectedRoute = ({children}: ProtectedRouteProps) => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false))
    }, [])

    const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    if (!refreshToken) {
      setIsAuthorized(false);
      return;
    }
    try {
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });
      if (res.status === 200) { // successful refresh
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error(error);
      setIsAuthorized(false);
    }
  };

  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const tokenExpiration = decoded.exp;
      const now = Date.now() / 1000;

      if (!tokenExpiration || tokenExpiration < now) {
        await refreshToken();
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error("Invalid token", error);
      setIsAuthorized(false);
    }
  };

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;