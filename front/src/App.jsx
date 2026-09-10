import { WallpaperProvider } from "./context/WallpaperContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navigate, Route, Routes } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import { SignIn } from "@clerk/clerk-react";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "@clerk/clerk-react";
import PageLoader from "./components/PageLoader";
import { axiosInstance } from "./lib/axios.js";
import { useStore } from "zustand";
import { useAuthStore } from "./Store/useAuthStore";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

function App() {
  const { isSignedIn, isLoaded } = useAuth();


  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) checkAuth();
    else clearAuth();
  }, [checkAuth, clearAuth, isLoaded, isSignedIn]);

  if (!isLoaded || (isSignedIn && isCheckingAuth)) return <PageLoader />;
  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route
            path="/"
            element={
              isSignedIn ? <ChatPage /> : <Navigate to={"/auth"} replace />
            }
          />
          <Route
            path="/auth"
            element={!isSignedIn ? <AuthPage /> : <Navigate to={"/"} replace />}
          />
          <Route
            path="/sign-in"
            element={
              <div className="flex justify-center items-center h-screen">
                <SignIn routing="path" path="/sign-in" />
              </div>
            }
          />
        </Routes>
        <Toaster />
      </WallpaperProvider>
    </ThemeProvider>
  );
}

export default App;
