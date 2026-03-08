import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import heroImageFallback from "@/assets/hero-image.jpg";

const Index = () => {
  const { data: featuredProducts } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .limit(6);
      return data || [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />

      {/* Hero */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <img src={heroImage} alt="SosoFab Collection" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-lg animate-fade-in">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-light mb-4">New Collection 2026</p>
            <h1 className="font-display text-5xl md:text-7xl font-light leading-tight text-card mb-6">
              Elegance<br />Redefined
            </h1>
            <p className="font-body text-sm text-card/80 mb-8 leading-relaxed max-w-sm">
              Discover curated luxury pieces that embody sophistication and timeless style.
            </p>
            <Link to="/shop">
              <Button className="bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs px-8 py-6 hover:bg-primary/90">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-2">Curated For You</p>
            <h2 className="font-display text-4xl md:text-5xl font-light">Featured Collection</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/shop">
              <Button variant="outline" className="font-body tracking-widest uppercase text-xs px-8 py-6 border-foreground text-foreground hover:bg-foreground hover:text-background">
                View All
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="bg-linen py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">Our Philosophy</p>
          <h2 className="font-display text-3xl md:text-4xl font-light mb-6 leading-snug">
            Crafted with intention. Worn with confidence.
          </h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Every piece in our collection is thoughtfully designed to elevate your wardrobe. 
            From luxurious fabrics to impeccable tailoring, SosoFab Lifestyle is where fashion meets artistry.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
