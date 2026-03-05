import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

export const useWishlist = () => {
  const [session, setSession] = useState<Session | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const { data: wishlistIds = [] } = useQuery({
    queryKey: ["wishlist-ids", session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", session!.user.id);
      return (data || []).map((w) => w.product_id);
    },
    enabled: !!session,
  });

  const toggleWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!session) throw new Error("Not authenticated");
      const isInWishlist = wishlistIds.includes(productId);
      if (isInWishlist) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", session.user.id)
          .eq("product_id", productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wishlists")
          .insert({ user_id: session.user.id, product_id: productId });
        if (error) throw error;
      }
    },
    onSuccess: (_, productId) => {
      const wasInWishlist = wishlistIds.includes(productId);
      toast.success(wasInWishlist ? "Removed from wishlist" : "Added to wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist-ids"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error: any) => {
      if (error.message === "Not authenticated") {
        toast.error("Sign in to add to wishlist");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    wishlistIds,
    isInWishlist: (productId: string) => wishlistIds.includes(productId),
    toggleWishlist: (productId: string) => toggleWishlist.mutate(productId),
    isAuthenticated: !!session,
  };
};
