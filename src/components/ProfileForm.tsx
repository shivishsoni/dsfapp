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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/AuthProvider";
import { countries } from "@/lib/countries";
import { states } from "@/lib/states";

interface ProfileFormData {
  name: string;
  email: string;
  address: string;
  age: number;
  phone_number: string;
  country: string;
  state: string;
  city: string;
}

const ProfileForm = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { session } = useAuth();

  const form = useForm<ProfileFormData>({
    defaultValues: {
      name: "",
      email: session?.user.email || "",
      address: "",
      age: 0,
      phone_number: "",
      country: "",
      state: "",
      city: "",
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
          name: data.name || "",
          email: session.user.email || "",
          address: data.address || "",
          age: data.age || 0,
          phone_number: data.phone_number || "",
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
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
        name: data.name,
        address: data.address,
        age: data.age,
        phone_number: data.phone_number,
        country: data.country,
        state: data.state,
        city: data.city,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
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
              <FormLabel>Age</FormLabel>
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} disabled />
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
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Save Profile
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;