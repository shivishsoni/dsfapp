import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Supplement {
  id: string;
  name: string;
  created_at: string;
}

const Index = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const { data: supplements, isLoading } = useQuery({
    queryKey: ["supplements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Supplement[];
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Supplement Tracker</h1>
        </div>

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
            {isLoading ? (
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
      </div>
    </div>
  );
};

export default Index;