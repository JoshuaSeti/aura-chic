import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { getProductImage } from "@/lib/productImages";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>();
  const [selectedColor, setSelectedColor] = useState<string>();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("slug", slug!).single();
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <CartDrawer />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground font-body">Loading...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <CartDrawer />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground font-body">Product not found</p>
        </div>
      </div>
    );
  }

  const image = getProductImage(product.slug, product.image_url);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const sizes = product.sizes?.filter((s) => s.length > 0) || [];
  const colors = product.colors?.filter((c) => c.length > 0) || [];

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addItem(product, selectedSize, selectedColor);
    toast.success("Added to bag");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />

      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Image */}
          <div className="bg-linen rounded overflow-hidden">
            <img src={image} alt={product.name} className="w-full aspect-[3/4] object-cover" />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-2">SosoFab Lifestyle</p>
              <h1 className="font-display text-3xl md:text-4xl font-light">{product.name}</h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-body text-2xl font-semibold">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <span className="font-body text-lg text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
              )}
            </div>

            <p className="font-body text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Sizes */}
            {sizes.length > 0 && (
              <div>
                <p className="font-body text-xs tracking-widest uppercase mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`font-body text-xs px-4 py-2 border rounded transition-colors ${
                        selectedSize === size
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div>
                <p className="font-body text-xs tracking-widest uppercase mb-3">Color</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`font-body text-xs px-4 py-2 border rounded transition-colors ${
                        selectedColor === color
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className="w-full bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-6 hover:bg-primary/90 disabled:opacity-50"
            >
              {product.in_stock ? "Add to Bag" : "Sold Out"}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
