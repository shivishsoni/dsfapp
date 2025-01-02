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
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error clearing session:", error);
    } finally {
      setSession(null);
      navigate("/login");
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during sign out:", error);
      }
    } catch (error) {
      console.error("Exception during sign out:", error);
    } finally {
      await clearSessionAndRedirect();
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          await clearSessionAndRedirect();
          return;
        }

        if (initialSession) {
          try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              console.error("User verification error:", userError);
              await clearSessionAndRedirect();
              return;
            }

            if (!user) {
              console.log("No user found in session");
              await clearSessionAndRedirect();
              return;
            }

            setSession(initialSession);
            if (window.location.pathname === "/login") {
              navigate("/");
            }
          } catch (error) {
            console.error("Error during user verification:", error);
            await clearSessionAndRedirect();
          }
        } else {
          console.log("No initial session");
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