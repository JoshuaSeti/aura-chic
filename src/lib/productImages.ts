import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

type ProductImageOptions = {
  slug: string;
  imageUrl?: string | null;
  images?: string[] | null;
  colorImages?: Record<string, string> | null;
  selectedColor?: string | null;
};

const slugToImage: Record<string, string> = {
  "velvet-evening-gown": product1,
  "silk-wrap-dress": product2,
  "leather-crossbody-bag": product3,
  "cashmere-overcoat": product4,
  "stiletto-ankle-boots": product5,
  "gold-chain-necklace": product6,
};

const isValidImage = (url?: string | null): url is string =>
  Boolean(url && url.trim().length > 0 && (url.startsWith("http") || url.startsWith("/") || url.startsWith("data:")));

export const getProductImage = (slug: string, imageUrl?: string | null): string => {
  if (isValidImage(imageUrl)) return imageUrl;
  return slugToImage[slug] || product1;
};

export const getPrimaryProductImage = ({ slug, imageUrl, images, colorImages, selectedColor }: ProductImageOptions): string => {
  const colorImage = selectedColor ? colorImages?.[selectedColor] : null;
  if (isValidImage(colorImage)) return colorImage;
  if (isValidImage(imageUrl)) return imageUrl;
  if (images?.length) {
    const firstImage = images.find(isValidImage);
    if (firstImage) return firstImage;
  }
  return slugToImage[slug] || product1;
};
