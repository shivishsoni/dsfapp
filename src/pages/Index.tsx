import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

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
      // First get all supplements
      const { data: existingSupplements, error: supplementsError } = await supabase
        .from("supplements")
        .select("*")
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
            user_id: (await supabase.auth.getUser()).data.user?.id
          });
        }

        const { data } = await supabase
          .from("supplements")
          .select("*")
          .order("created_at", { ascending: false });
        return data as Supplement[];
      }

      // Then get logs for the selected date
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

  // Refetch supplements when date changes
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

      // Update the local state to show the supplement as logged
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
          <h1 className="text-2xl font-bold">{t('app.title')}</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleLanguage}
            className="rounded-full"
          >
            <Globe className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">{t('app.tabs.chat')}</TabsTrigger>
            <TabsTrigger value="supplements">{t('app.tabs.supplements')}</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4 min-h-[500px] flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={index}
                    message={msg.message}
                    isUser={msg.isUser}
                  />
                ))}
              </div>
              <ChatInput 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading}
                placeholder={t('chat.input.placeholder')}
              />
            </div>
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
                {supplementsLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : supplements?.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    {t('supplements.empty')}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {supplements?.map((supplement) => (
                      <div
                        key={supplement.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium">{supplement.name}</span>
                        <Button
                          onClick={() => logSupplement(supplement.id)}
                          disabled={!date}
                          variant={loggedSupplements.has(supplement.id) ? "secondary" : "default"}
                          className={cn(
                            loggedSupplements.has(supplement.id) && "bg-green-500 hover:bg-green-600"
                          )}
                        >
                          {loggedSupplements.has(supplement.id) 
                            ? t('supplements.logged.button') 
                            : t('supplements.log.button')}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;