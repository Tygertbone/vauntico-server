import React from "react";
import { AuthContext } from "../../context/AuthContext";

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={{ user: null }}>
      {children}
    </AuthContext.Provider>
  );
}
