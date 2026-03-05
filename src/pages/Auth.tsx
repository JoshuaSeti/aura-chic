import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import logo from "@/assets/logo.jpeg";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! You're now signed in.");
        navigate("/account");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        navigate("/account");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <img src={logo} alt="SosoFab" className="h-14 mx-auto mb-6" />
            <h1 className="font-display text-3xl">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
            <p className="font-body text-sm text-muted-foreground mt-2">
              {isSignUp ? "Join SosoFab Lifestyle" : "Sign in to your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="font-body"
                required
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="font-body"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="font-body"
              required
              minLength={6}
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-5 hover:bg-primary/90"
            >
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-body text-sm text-primary hover:underline"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
            {!isSignUp && (
              <button
                onClick={async () => {
                  if (!email) { toast.error("Enter your email first"); return; }
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  if (error) toast.error(error.message);
                  else toast.success("Password reset email sent!");
                }}
                className="block mx-auto font-body text-xs text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Auth;
