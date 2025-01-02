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

  const clearSessionAndRedirect = async () => {
    setSession(null);
    navigate("/login");
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await clearSessionAndRedirect();
    } catch (error) {
      console.error("Error during sign out:", error);
      await clearSessionAndRedirect();
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          setSession(initialSession);
          if (window.location.pathname === "/login") {
            navigate("/");
          }
        } else {
          await clearSessionAndRedirect();
        }
      } catch (error) {
        console.error("Error during session initialization:", error);
        await clearSessionAndRedirect();
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_OUT") {
          await clearSessionAndRedirect();
          return;
        }

        if (currentSession) {
          setSession(currentSession);
          if (window.location.pathname === "/login") {
            navigate("/");
          }
        } else {
          await clearSessionAndRedirect();
        }
        
        setIsLoading(false);
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