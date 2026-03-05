import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Heart, User, Lock, LogOut } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

const Account = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (!session) navigate("/auth");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) navigate("/auth");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session!.user.id)
        .single();
      return data;
    },
    enabled: !!session,
  });

  const { data: wishlistItems } = useQuery({
    queryKey: ["wishlist", session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("wishlists")
        .select("*, product:products(*)")
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!session,
  });

  const removeWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", session!.user.id)
        .eq("product_id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    },
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords don't match");
      return;
    }
    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session!.user.email!,
      password: currentPassword,
    });
    if (signInError) {
      toast.error("Current password is incorrect");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />

      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl">My Account</h1>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Welcome back, {profile?.full_name || session.user.email}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="font-body text-xs tracking-widest uppercase gap-2"
            >
              <LogOut size={14} /> Sign Out
            </Button>
          </div>

          <Tabs defaultValue="wishlist" className="space-y-6">
            <TabsList className="bg-muted font-body">
              <TabsTrigger value="wishlist" className="gap-2 text-xs tracking-wider uppercase">
                <Heart size={14} /> Wishlist
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2 text-xs tracking-wider uppercase">
                <User size={14} /> Profile
              </TabsTrigger>
              <TabsTrigger value="password" className="gap-2 text-xs tracking-wider uppercase">
                <Lock size={14} /> Password
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wishlist">
              {wishlistItems && wishlistItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlistItems.map((item: any) => (
                    <div key={item.id} className="relative">
                      <ProductCard product={item.product} />
                      <button
                        onClick={() => removeWishlistMutation.mutate(item.product_id)}
                        className="absolute top-2 right-2 bg-background/80 backdrop-blur rounded-full p-2 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Heart className="mx-auto mb-4 text-muted-foreground" size={40} />
                  <p className="font-body text-muted-foreground">Your wishlist is empty</p>
                  <Button
                    variant="outline"
                    className="mt-4 font-body text-xs tracking-widest uppercase"
                    onClick={() => navigate("/shop")}
                  >
                    Browse Shop
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile">
              <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                <div>
                  <label className="font-body text-xs tracking-wider uppercase text-muted-foreground">Email</label>
                  <p className="font-body text-sm mt-1">{session.user.email}</p>
                </div>
                <div>
                  <label className="font-body text-xs tracking-wider uppercase text-muted-foreground">Name</label>
                  <p className="font-body text-sm mt-1">{profile?.full_name || "Not set"}</p>
                </div>
                <div>
                  <label className="font-body text-xs tracking-wider uppercase text-muted-foreground">Member Since</label>
                  <p className="font-body text-sm mt-1">
                    {new Date(session.user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="password">
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-display text-xl mb-4">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                  <Input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="font-body"
                    required
                  />
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="font-body"
                    required
                    minLength={6}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="font-body"
                    required
                    minLength={6}
                  />
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-5 hover:bg-primary/90"
                  >
                    Update Password
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Account;
