import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import { AuthProvider } from "@/components/AuthProvider";
import PasswordProtection from "@/components/PasswordProtection";
import SimpleProtectedRoute from "@/components/SimpleProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/password" element={<PasswordProtection />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <SimpleProtectedRoute>
                  <Index />
                </SimpleProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;