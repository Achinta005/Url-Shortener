import React from "react";
import LinkeShortener from "./LinkeShortener";
import ProtectedRoute from "../lib/protectedRoute";

const page = () => {
  return (
    <div>
      <ProtectedRoute>
        <LinkeShortener />
      </ProtectedRoute>
    </div>
  );
};

export default page;
