import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { getProductImage } from "@/lib/productImages";

type Product = Tables<"products">;

const ProductCard = ({ product }: { product: Product }) => {
  const image = getProductImage(product.slug, product.image_url);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden bg-linen aspect-[3/4] rounded">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground font-body text-xs px-2 py-1 tracking-wider uppercase">
            Sale
          </span>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <span className="font-body text-sm tracking-widest uppercase text-primary-foreground">Sold Out</span>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-display text-lg group-hover:text-primary transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-semibold">${product.price.toFixed(2)}</span>
          {hasDiscount && (
            <span className="font-body text-xs text-muted-foreground line-through">
              ${product.compare_at_price!.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
