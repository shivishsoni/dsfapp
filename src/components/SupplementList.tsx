import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Supplement {
  id: string;
  name: string;
  created_at: string;
}

interface SupplementListProps {
  supplements: Supplement[] | null;
  loggedSupplements: Set<string>;
  onLogSupplement: (id: string) => void;
  isLoading: boolean;
  date?: Date;
}

const SupplementList = ({ 
  supplements, 
  loggedSupplements, 
  onLogSupplement, 
  isLoading,
  date 
}: SupplementListProps) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!supplements?.length) {
    return (
      <p className="text-center text-muted-foreground">
        {t('supplements.empty')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {supplements.map((supplement) => (
        <div
          key={supplement.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <span className="font-medium">{supplement.name}</span>
          <Button
            onClick={() => onLogSupplement(supplement.id)}
            disabled={!date}
            variant={loggedSupplements.has(supplement.id) ? "secondary" : "default"}
            className={cn(
              loggedSupplements.has(supplement.id) && "bg-green-500 hover:bg-green-600"
            )}
          >
            {loggedSupplements.has(supplement.id) 
              ? "Logged" 
              : t('supplements.log.button')}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default SupplementList;