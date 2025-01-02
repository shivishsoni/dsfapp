import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import Logo from "./Logo";

const TEMP_PASSWORD = "dsf2024"; // This is just for testing phase

const PasswordProtection = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === TEMP_PASSWORD) {
      localStorage.setItem("dsf-auth", "true");
      navigate("/");
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <h1 className="text-2xl font-bold text-center">Password Protected</h1>
          <p className="text-center text-muted-foreground">
            Please enter the password to access the application.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full"
            />
            <Button type="submit" className="w-full">
              Enter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordProtection;