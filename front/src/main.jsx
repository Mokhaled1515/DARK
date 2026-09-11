// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import App from "./App.jsx";
// import { ClerkProvider } from "@clerk/clerk-react";
// import { BrowserRouter } from "react-router-dom";

// const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// if (!PUBLISHABLE_KEY) {
//   throw new Error("Missing Publishable Key from Clerk");
// }
// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
//       <BrowserRouter>
//         <App />
//       </BrowserRouter>
//     </ClerkProvider>
//   </StrictMode>,
// );

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import { setTokenGetter } from "./lib/clerkToken.js";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key from Clerk");
}

function ClerkTokenSetup({ children }) {
  const { getToken } = useAuth();

  setTokenGetter(getToken);

  return children;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ClerkTokenSetup>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkTokenSetup>
    </ClerkProvider>
  </StrictMode>,
);
