import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";
import { queryClient } from "./lib/queryClient";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster 
          richColors 
          position="top-right" 
          toastOptions={{
          style: {
            background: "transparent",
            padding: "10px",
            backdropFilter: "blur(8px)"
          },
        }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
