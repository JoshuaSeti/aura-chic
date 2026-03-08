// Static product image mapping for seeded products
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

const slugToImage: Record<string, string> = {
  "velvet-evening-gown": product1,
  "silk-wrap-dress": product2,
  "leather-crossbody-bag": product3,
  "cashmere-overcoat": product4,
  "stiletto-ankle-boots": product5,
  "gold-chain-necklace": product6,
};

export const getProductImage = (slug: string, imageUrl?: string | null): string => {
  if (imageUrl && imageUrl.trim().length > 0 && imageUrl.startsWith("http")) return imageUrl;
  return slugToImage[slug] || product1;
};
