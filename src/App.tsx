import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import { AuthProvider } from "@/components/AuthProvider";
import PasswordProtection from "@/components/PasswordProtection";
import SimpleProtectedRoute from "@/components/SimpleProtectedRoute";

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;