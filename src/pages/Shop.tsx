import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");
  const searchQuery = searchParams.get("q") || "";
  const selectedSize = searchParams.get("size") || "all";
  const availability = searchParams.get("availability") || "all";
  const sortBy = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("min") || "";
  const maxPrice = searchParams.get("max") || "";

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", categorySlug],
    queryFn: async () => {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (categorySlug) {
        const cat = categories?.find((c) => c.slug === categorySlug);
        if (cat) query = query.eq("category_id", cat.id);
      }
      const { data } = await query;
      return data || [];
    },
    enabled: !categorySlug || !!categories,
  });

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products?.forEach((product) => {
      product.sizes?.forEach((size) => {
        if (/^\d+$/.test(size)) sizes.add(size);
      });
    });
    return Array.from(sizes).sort((a, b) => Number(a) - Number(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return [...(products || [])]
      .filter((product) => {
        const matchesSearch =
          !normalizedSearch ||
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.description?.toLowerCase().includes(normalizedSearch);
        const matchesSize = selectedSize === "all" || product.sizes?.includes(selectedSize);
        const matchesStock = availability === "all" || (availability === "in-stock" ? product.in_stock : !product.in_stock);
        const matchesMin = min === null || product.price >= min;
        const matchesMax = max === null || product.price <= max;
        return matchesSearch && matchesSize && matchesStock && matchesMin && matchesMax;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [availability, maxPrice, minPrice, products, searchQuery, selectedSize, sortBy]);

  const hasActiveFilters = searchParams.toString().length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />

      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-light mb-2">Shop</h1>
          <p className="font-body text-sm text-muted-foreground">Explore our curated collection</p>
        </div>

        <div className="mb-8 space-y-5 border-y border-border py-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => updateFilter("q", event.target.value)}
                placeholder="Search products"
                className="pl-10 font-body"
              />
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-body text-xs uppercase tracking-widest">{filteredProducts.length} products</span>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="inline-flex items-center gap-1 font-body text-xs uppercase tracking-widest text-foreground hover:text-primary">
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => updateFilter("min", event.target.value)}
              placeholder="Min price"
              className="font-body"
            />
            <Input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => updateFilter("max", event.target.value)}
              placeholder="Max price"
              className="font-body"
            />
            <Select value={selectedSize} onValueChange={(value) => updateFilter("size", value)}>
              <SelectTrigger className="font-body">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sizes</SelectItem>
                {availableSizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    Size {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availability} onValueChange={(value) => updateFilter("availability", value)}>
              <SelectTrigger className="font-body">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stock</SelectItem>
                <SelectItem value="in-stock">In stock</SelectItem>
                <SelectItem value="sold-out">Sold out</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => updateFilter("sort", value)}>
              <SelectTrigger className="font-body">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: low to high</SelectItem>
                <SelectItem value="price-high">Price: high to low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(minPrice || maxPrice) && (
            <p className="font-body text-xs text-muted-foreground">
              Price range: {minPrice ? formatPrice(Number(minPrice)) : "Any"} — {maxPrice ? formatPrice(Number(maxPrice)) : "Any"}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => updateFilter("category", "all")}
            className={`font-body text-xs tracking-widest uppercase px-4 py-2 border rounded transition-colors ${
              !categorySlug ? "bg-foreground text-background border-foreground" : "border-border text-foreground hover:bg-muted"
            }`}
          >
            All
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter("category", cat.slug)}
              className={`font-body text-xs tracking-widest uppercase px-4 py-2 border rounded transition-colors ${
                categorySlug === cat.slug ? "bg-foreground text-background border-foreground" : "border-border text-foreground hover:bg-muted"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted aspect-[3/4] rounded" />
                <div className="mt-3 h-4 bg-muted rounded w-3/4" />
                <div className="mt-2 h-3 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground font-body py-20">No products match your filters.</p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
