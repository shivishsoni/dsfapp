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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if there's an error, we should clear the session and redirect
      setSession(null);
      navigate("/login");
    }
  };

  useEffect(() => {
    // Initialize session
    const initSession = async () => {
      try {
        // First, try to recover the session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", initialSession ? "Session found" : "No session");
        
        if (initialSession) {
          // Verify the session is still valid
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !user) {
            console.log("Session invalid, signing out");
            await signOut();
            return;
          }
          
          setSession(initialSession);
        } else {
          console.log("No initial session found, redirecting to login");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error during session initialization:", error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        
        if (currentSession) {
          console.log("New session detected");
          setSession(currentSession);
        } else {
          console.log("No session in state change");
          setSession(null);
        }
        
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