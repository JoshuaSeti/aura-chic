import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { getPrimaryProductImage } from "@/lib/productImages";
import { formatPrice } from "@/lib/utils";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, total, isOpen, setIsOpen } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md bg-background flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Your Bag</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground font-body text-sm">Your bag is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div key={item.product.id + (item.selectedSize || "") + (item.selectedColor || "")} className="flex gap-4">
                  <img
                    src={getPrimaryProductImage({
                      slug: item.product.slug,
                      imageUrl: item.product.image_url,
                      images: item.product.images,
                      colorImages: item.product.color_images as Record<string, string> | null,
                      selectedColor: item.selectedColor,
                    })}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-lg leading-tight truncate">{item.product.name}</h4>
                    {item.selectedSize && (
                      <p className="text-xs text-muted-foreground font-body mt-1">Size: {item.selectedSize}</p>
                    )}
                    {item.selectedColor && (
                      <p className="text-xs text-muted-foreground font-body">Color: {item.selectedColor}</p>
                    )}
                    <p className="text-sm font-body font-semibold text-primary mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 rounded hover:bg-muted">
                        <Minus size={14} />
                      </button>
                      <span className="font-body text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 rounded hover:bg-muted">
                        <Plus size={14} />
                      </button>
                      <button onClick={() => removeItem(item.product.id)} className="p-1 ml-auto text-destructive hover:bg-destructive/10 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between font-body">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <Link to="/checkout" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground font-body tracking-widest uppercase text-sm hover:bg-primary/90">
                  Checkout
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
