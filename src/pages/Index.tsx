import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Supplement {
  id: string;
  name: string;
  created_at: string;
}

const Index = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [messages, setMessages] = useState<Array<{ message: string; isUser: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: supplements, isLoading: supplementsLoading } = useQuery({
    queryKey: ["supplements"],
    queryFn: async () => {
      const { data: existingSupplements } = await supabase
        .from("supplements")
        .select("*")
        .order("created_at", { ascending: false });

      if (!existingSupplements || existingSupplements.length === 0) {
        // Add default supplements if none exist
        const defaultSupplements = [
          { name: "Dhara Shakti Morning" },
          { name: "Dhara Shakti Evening" }
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

      return existingSupplements as Supplement[];
    },
  });

  const logSupplement = async (supplementId: string) => {
    try {
      const { error } = await supabase.from("supplement_logs").insert({
        supplement_id: supplementId,
        taken_date: date?.toISOString().split("T")[0],
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Supplement logged successfully",
      });
    } catch (error) {
      console.error("Error logging supplement:", error);
      toast({
        title: "Error",
        description: "Failed to log supplement",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { message, isUser: true }]);

      const response = await supabase.functions.invoke('chat', {
        body: { message }
      });

      if (response.error) throw response.error;

      setMessages(prev => [...prev, { message: response.data.response, isUser: false }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">DSF App</h1>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat Assistant</TabsTrigger>
            <TabsTrigger value="supplements">Supplement Tracker</TabsTrigger>
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
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          </TabsContent>

          <TabsContent value="supplements">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Select Date</h2>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Log Supplements</h2>
                {supplementsLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : supplements?.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No supplements found. Add some to get started!
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
                        >
                          Log
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