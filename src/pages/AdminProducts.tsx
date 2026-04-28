import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Upload, X, Star } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

const COMMON_SIZES = Array.from({ length: 26 }, (_, index) => String(index + 30));
const DEFAULT_SIZES = Array.from({ length: 15 }, (_, index) => String(index + 36));
const MAX_FILE_SIZE = 3 * 1024 * 1024;

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [editProduct, setEditProduct] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newColor, setNewColor] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} must be under 3MB`);
      return false;
    }
    if (!file.type.startsWith("image/")) {
      toast.error(`${file.name} must be an image`);
      return false;
    }
    return true;
  };

  const uploadProductImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const fileName = `products/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) throw error;

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const persistProductImages = async (updates: Record<string, any>) => {
    if (!editProduct?.id) return;

    const { error } = await supabase
      .from("products")
      .update(updates as any)
      .eq("id", editProduct.id);

    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const handleImageUpload = async (files: FileList | File[], mode: "main" | "gallery" | "color", color?: string) => {
    const validFiles = Array.from(files).filter(validateImage);
    if (!validFiles.length) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of validFiles) {
        uploadedUrls.push(await uploadProductImage(file));
      }

      const currentImages = editProduct.images || [];
      const nextImages = Array.from(new Set([...currentImages, ...uploadedUrls]));
      let updates: Record<string, any> = { images: nextImages };

      setEditProduct((prev: any) => {
        if (!prev) return prev;

        if (mode === "color" && color) {
          const nextColorImages = { ...(prev.color_images || {}), [color]: uploadedUrls[0] };
          updates = { ...updates, color_images: nextColorImages };
          return {
            ...prev,
            images: nextImages,
            color_images: nextColorImages,
            image_url: prev.image_url || uploadedUrls[0],
          };
        }

        if (mode === "gallery") {
          return {
            ...prev,
            images: nextImages,
            image_url: prev.image_url || uploadedUrls[0],
          };
        }

        updates = { ...updates, image_url: uploadedUrls[0] };
        return {
          ...prev,
          image_url: uploadedUrls[0],
          images: nextImages,
        };
      });

      if (editProduct?.id) {
        await persistProductImages(updates);
        toast.success("Images uploaded and saved");
      } else {
        toast.success("Images uploaded");
      }
    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setEditProduct((prev: any) => {
      const nextImages = (prev.images || []).filter((image: string) => image !== url);
      const nextColorImages = Object.fromEntries(
        Object.entries(prev.color_images || {}).filter(([, imageUrl]) => imageUrl !== url)
      );
      const nextImageUrl = prev.image_url === url ? nextImages[0] || "" : prev.image_url;
      return { ...prev, images: nextImages, color_images: nextColorImages, image_url: nextImageUrl };
    });
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (product: any) => {
      if (product.id) {
        const { error } = await supabase.from("products").update(product).eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(product);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setDialogOpen(false);
      setEditProduct(null);
      toast.success("Product saved");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openNew = () => {
    setEditProduct({ name: "", slug: "", description: "", price: 0, compare_at_price: null, category_id: null, image_url: "", images: [], color_images: {}, in_stock: true, featured: false, sizes: DEFAULT_SIZES, colors: [] });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditProduct({ ...p, category_id: p.category_id || null, images: p.images || [], color_images: p.color_images || {} });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (uploading) {
      toast.error("Please wait for the image upload to finish");
      return;
    }

    const payload: any = {
      name: editProduct.name,
      slug: editProduct.slug,
      description: editProduct.description || null,
      price: editProduct.price,
      compare_at_price: editProduct.compare_at_price || null,
      category_id: editProduct.category_id || null,
      image_url: editProduct.image_url || (editProduct.images || [])[0] || null,
      images: editProduct.images || [],
      color_images: editProduct.color_images || {},
      in_stock: editProduct.in_stock,
      featured: editProduct.featured,
      sizes: editProduct.sizes || [],
      colors: editProduct.colors || [],
    };
    if (editProduct.id) {
      payload.id = editProduct.id;
    }
    saveMutation.mutate(payload);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Products</h1>
        <Button onClick={openNew} className="bg-primary text-primary-foreground font-body text-xs tracking-wider uppercase">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="bg-card rounded border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-body text-xs tracking-wider uppercase">Name</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Category</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Price</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Stock</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Featured</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center font-body text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : products?.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-body text-sm">{p.name}</TableCell>
                <TableCell className="font-body text-sm text-muted-foreground">{p.categories?.name || "—"}</TableCell>
                <TableCell className="font-body text-sm">{formatPrice(p.price)}</TableCell>
                <TableCell><span className={`font-body text-xs ${p.in_stock ? "text-primary" : "text-destructive"}`}>{p.in_stock ? "In Stock" : "Out"}</span></TableCell>
                <TableCell><span className={`font-body text-xs ${p.featured ? "text-primary" : "text-muted-foreground"}`}>{p.featured ? "Yes" : "No"}</span></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editProduct?.id ? "Edit Product" : "New Product"}</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Name</label>
                <Input value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
              </div>
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Slug</label>
                <Input value={editProduct.slug} onChange={(e) => setEditProduct({ ...editProduct, slug: e.target.value })} />
              </div>
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Description</label>
                <Textarea value={editProduct.description || ""} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs tracking-wider uppercase block mb-1">Price</label>
                  <Input type="number" step="0.01" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="font-body text-xs tracking-wider uppercase block mb-1">Compare at Price</label>
                  <Input type="number" step="0.01" value={editProduct.compare_at_price || ""} onChange={(e) => setEditProduct({ ...editProduct, compare_at_price: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
              </div>
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Category</label>
                <Select value={editProduct.category_id || ""} onValueChange={(v) => setEditProduct({ ...editProduct, category_id: v || null })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 rounded border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="font-body text-xs tracking-wider uppercase block">Product Images</label>
                    <p className="text-xs text-muted-foreground mt-1">Upload one main image or multiple gallery images. Max 3MB each.</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) handleImageUpload(files, "main");
                        e.target.value = "";
                      }}
                    />
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) handleImageUpload(files, "gallery");
                        e.target.value = "";
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                      <Star className="mr-2 h-4 w-4" /> Main
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => galleryInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" /> Gallery
                    </Button>
                  </div>
                </div>
                <Input
                  value={editProduct.image_url || ""}
                  onChange={(e) => setEditProduct({ ...editProduct, image_url: e.target.value })}
                  placeholder="Main image URL or upload"
                />
                {(editProduct.images || []).length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {(editProduct.images || []).map((image: string) => (
                      <div key={image} className="relative rounded border border-border overflow-hidden bg-linen aspect-square">
                        <img src={image} alt="Product upload preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditProduct({ ...editProduct, image_url: image })}
                          className={`absolute left-1 top-1 rounded bg-background/80 px-1.5 py-0.5 font-body text-[10px] ${editProduct.image_url === image ? "text-primary" : "text-foreground"}`}
                        >
                          Main
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(image)}
                          className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-2">Sizes</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
                  {COMMON_SIZES.map((size) => {
                    const checked = (editProduct.sizes || []).includes(size);
                    return (
                      <label key={size} className="flex items-center gap-1.5 font-body text-sm cursor-pointer">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const current = editProduct.sizes || [];
                            setEditProduct({
                              ...editProduct,
                              sizes: v ? [...current, size] : current.filter((s: string) => s !== size),
                            });
                          }}
                        />
                        {size}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-body text-xs tracking-wider uppercase block">Colors</label>
                <div className="flex flex-wrap gap-1.5">
                  {(editProduct.colors || []).map((color: string) => (
                    <Badge key={color} variant="secondary" className="gap-1 font-body text-xs">
                      {color}
                      <button
                        type="button"
                        onClick={() =>
                          setEditProduct({
                            ...editProduct,
                            colors: editProduct.colors.filter((c: string) => c !== color),
                            color_images: Object.fromEntries(Object.entries(editProduct.color_images || {}).filter(([key]) => key !== color)),
                          })
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="e.g. Black, Red, Navy"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = newColor.trim();
                        if (trimmed && !(editProduct.colors || []).includes(trimmed)) {
                          setEditProduct({ ...editProduct, colors: [...(editProduct.colors || []), trimmed] });
                          setNewColor("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const trimmed = newColor.trim();
                      if (trimmed && !(editProduct.colors || []).includes(trimmed)) {
                        setEditProduct({ ...editProduct, colors: [...(editProduct.colors || []), trimmed] });
                        setNewColor("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                {(editProduct.colors || []).length > 0 && (
                  <div className="space-y-2 rounded border border-border p-3">
                    <p className="font-body text-xs tracking-wider uppercase text-muted-foreground">Color images</p>
                    {(editProduct.colors || []).map((color: string) => (
                      <div key={color} className="grid grid-cols-[72px_1fr_auto] items-center gap-3">
                        <div className="h-14 w-14 overflow-hidden rounded border border-border bg-linen">
                          {editProduct.color_images?.[color] ? (
                            <img src={editProduct.color_images[color]} alt={`${color} product`} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <Input
                          value={editProduct.color_images?.[color] || ""}
                          onChange={(e) => setEditProduct({
                            ...editProduct,
                            color_images: { ...(editProduct.color_images || {}), [color]: e.target.value },
                          })}
                          placeholder={`${color} image URL`}
                        />
                        <label className="inline-flex">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploading}
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) handleImageUpload(files, "color", color);
                              e.target.value = "";
                            }}
                          />
                          <span className="inline-flex h-10 items-center rounded border border-input bg-background px-3 font-body text-xs tracking-wider uppercase cursor-pointer hover:bg-muted">
                            Upload
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 font-body text-sm">
                  <Switch checked={editProduct.in_stock} onCheckedChange={(v) => setEditProduct({ ...editProduct, in_stock: v })} />
                  In Stock
                </label>
                <label className="flex items-center gap-2 font-body text-sm">
                  <Switch checked={editProduct.featured} onCheckedChange={(v) => setEditProduct({ ...editProduct, featured: v })} />
                  Featured
                </label>
              </div>
              <Button onClick={handleSave} disabled={saveMutation.isPending || uploading} className="w-full bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-5">
                {uploading ? "Uploading images..." : saveMutation.isPending ? "Saving..." : "Save Product"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
