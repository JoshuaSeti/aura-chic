import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getPrimaryProductImage } from "@/lib/productImages";
import { formatPrice } from "@/lib/utils";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <CartDrawer />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl mb-4">Your bag is empty</h1>
            <Button onClick={() => navigate("/shop")} variant="outline" className="font-body tracking-widest uppercase text-xs">
              Continue Shopping
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderItems = items.map((i) => ({
      product_id: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      size: i.selectedSize,
      color: i.selectedColor,
    }));

    const { error } = await supabase.from("orders").insert({
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone || null,
      shipping_address: form.address,
      items: orderItems,
      total,
    });

    if (error) {
      toast.error("Failed to place order");
    } else {
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />

      <div className="container mx-auto px-4 py-12 flex-1">
        <h1 className="font-display text-3xl md:text-4xl text-center mb-10">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-display text-xl mb-4">Shipping Details</h2>
            <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="font-body" />
            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="font-body" />
            <Input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="font-body" />
            <Textarea placeholder="Shipping Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required className="font-body" />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-6 hover:bg-primary/90"
            >
              {loading ? "Placing Order..." : `Place Order — ${formatPrice(total)}`}
            </Button>
          </form>

          {/* Summary */}
          <div>
            <h2 className="font-display text-xl mb-4">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <img src={getPrimaryProductImage({
                      slug: item.product.slug,
                      imageUrl: item.product.image_url,
                      images: item.product.images,
                      colorImages: item.product.color_images as Record<string, string> | null,
                      selectedColor: item.selectedColor,
                    })} alt={item.product.name} className="w-16 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-body text-sm">{item.product.name}</p>
                    <p className="font-body text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-body text-sm font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="font-body font-semibold">Total</span>
                <span className="font-body font-semibold text-lg">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
