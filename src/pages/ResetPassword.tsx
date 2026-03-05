import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery session in hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("type") !== "recovery") {
      // Also check query params
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get("type") !== "recovery") {
        // Still allow the page — they might have a valid session
      }
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate("/account");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="font-display text-3xl">Reset Password</h1>
            <p className="font-body text-sm text-muted-foreground mt-2">Enter your new password</p>
          </div>
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="font-body"
              required
              minLength={6}
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="font-body"
              required
              minLength={6}
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-5 hover:bg-primary/90"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
