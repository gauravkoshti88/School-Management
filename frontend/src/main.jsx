import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";
import { WebsiteProvider } from "./context/WebsiteContext.jsx";
import { StaffProvider } from "./context/StaffContext.jsx";
import { StudentProvider } from "./context/StudentContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AdminProvider>
      <WebsiteProvider>
        <StaffProvider>
          <StudentProvider>
            <App />
          </StudentProvider>
        </StaffProvider>
      </WebsiteProvider>
    </AdminProvider>
  </StrictMode>,
);
