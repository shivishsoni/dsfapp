import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import SupplementList from "@/components/SupplementList";
import ChatSection from "@/components/ChatSection";
import ProfileMenu from "@/components/ProfileMenu";

interface Supplement {
  id: string;
  name: string;
  created_at: string;
}

const Index = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [messages, setMessages] = useState<Array<{ message: string; isUser: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedSupplements, setLoggedSupplements] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();

  const { data: supplements, isLoading: supplementsLoading, refetch: refetchSupplements } = useQuery({
    queryKey: ["supplements", date?.toISOString()],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: existingSupplements, error: supplementsError } = await supabase
        .from("supplements")
        .select("*")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false });

      if (supplementsError) throw supplementsError;

      if (!existingSupplements || existingSupplements.length === 0) {
        const defaultSupplements = [
          { name: language === 'hi' ? "धारा शक्ति सुबह" : "Dhara Shakti Morning" },
          { name: language === 'hi' ? "धारा शक्ति शाम" : "Dhara Shakti Evening" }
        ];

        for (const supplement of defaultSupplements) {
          await supabase.from("supplements").insert({
            name: supplement.name,
            user_id: user.id
          });
        }

        const { data } = await supabase
          .from("supplements")
          .select("*")
          .eq('user_id', user.id)
          .order("created_at", { ascending: false });
          
        return data as Supplement[];
      }

      if (date) {
        const { data: logs } = await supabase
          .from("supplement_logs")
          .select("supplement_id")
          .eq("taken_date", date.toISOString().split("T")[0]);

        if (logs) {
          setLoggedSupplements(new Set(logs.map(log => log.supplement_id)));
        }
      }

      return existingSupplements as Supplement[];
    },
  });

  useEffect(() => {
    refetchSupplements();
  }, [date, refetchSupplements]);

  const logSupplement = async (supplementId: string) => {
    try {
      const { error } = await supabase.from("supplement_logs").insert({
        supplement_id: supplementId,
        taken_date: date?.toISOString().split("T")[0],
      });

      if (error) throw error;

      setLoggedSupplements(prev => new Set([...prev, supplementId]));
      
      toast({
        title: "Success",
        description: t('success.supplement.logged'),
      });
    } catch (error) {
      console.error("Error logging supplement:", error);
      toast({
        title: "Error",
        description: t('error.supplement.failed'),
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { message, isUser: true }]);

      const response = await supabase.functions.invoke('chat', {
        body: { message, language }
      });

      if (response.error) throw response.error;

      setMessages(prev => [...prev, { message: response.data.response, isUser: false }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: t('error.chat.failed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-full"
            >
              <Globe className="h-4 w-4" />
            </Button>
            <ProfileMenu />
          </div>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">{t('app.tabs.chat')}</TabsTrigger>
            <TabsTrigger value="supplements">{t('app.tabs.supplements')}</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <ChatSection 
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder={t('chat.input.placeholder')}
            />
          </TabsContent>

          <TabsContent value="supplements">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">{t('supplements.date.title')}</h2>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">{t('supplements.title')}</h2>
                <SupplementList 
                  supplements={supplements}
                  loggedSupplements={loggedSupplements}
                  onLogSupplement={logSupplement}
                  isLoading={supplementsLoading}
                  date={date}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
