import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {API_ONE} from "../api/api";

export default function ProtectedRoute({ children, role }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await API_ONE.get("/auth/me"); // backend endpoint to get current user
        if (!role || res.data.role === role) {
          setAuthorized(true);
        }
      } catch (err) {
        //.error(err);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [role]);

  if (loading) return <div>Loading...</div>;
  if (!authorized) return <Navigate to="/" />;
  return children;
}
