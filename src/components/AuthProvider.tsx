import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<{
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}>({
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    // Initialize session
    const initSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("Initial session:", initialSession);
        setSession(initialSession);
        
        if (!initialSession) {
          console.log("No initial session found, redirecting to login");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession);
        setSession(currentSession);
        setIsLoading(false);

        if (event === "SIGNED_OUT") {
          navigate("/login");
        } else if (event === "SIGNED_IN" && window.location.pathname === "/login") {
          navigate("/");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};