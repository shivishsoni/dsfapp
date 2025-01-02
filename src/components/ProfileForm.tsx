import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/components/AuthProvider";

interface ProfileFormData {
  address: string;
  age: number;
  phone_number: string;
}

const ProfileForm = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { session } = useAuth();

  const form = useForm<ProfileFormData>({
    defaultValues: {
      address: "",
      age: 0,
      phone_number: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: t("error.profile.fetch"),
          variant: "destructive",
        });
        return;
      }

      if (data) {
        form.reset({
          address: data.address || "",
          age: data.age || 0,
          phone_number: data.phone_number || "",
        });
      }
    };

    fetchProfile();
  }, [session?.user.id]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!session?.user.id) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        address: data.address,
        age: data.age,
        phone_number: data.phone_number,
      })
      .eq("id", session.user.id);

    if (error) {
      toast({
        title: "Error",
        description: t("error.profile.update"),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: t("success.profile.update"),
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6">{t("profile.title")}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.address")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.age")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.phone")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {t("profile.save")}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ProfileForm;