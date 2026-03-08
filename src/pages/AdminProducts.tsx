import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [editProduct, setEditProduct] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be under 3MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setEditProduct((prev: any) => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
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
    setEditProduct({ name: "", slug: "", description: "", price: 0, compare_at_price: null, category_id: null, image_url: "", in_stock: true, featured: false, sizes: [], colors: [] });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditProduct({ ...p, category_id: p.category_id || null });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload: any = {
      name: editProduct.name,
      slug: editProduct.slug,
      description: editProduct.description || null,
      price: editProduct.price,
      compare_at_price: editProduct.compare_at_price || null,
      category_id: editProduct.category_id || null,
      image_url: editProduct.image_url || null,
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
                <TableCell className="font-body text-sm">${p.price.toFixed(2)}</TableCell>
                <TableCell><span className={`font-body text-xs ${p.in_stock ? "text-green-600" : "text-destructive"}`}>{p.in_stock ? "In Stock" : "Out"}</span></TableCell>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Product Image</label>
                {editProduct.image_url && (
                  <img src={editProduct.image_url} alt="Preview" className="w-20 h-20 object-cover rounded mb-2 border border-border" />
                )}
                <div className="flex gap-2">
                  <Input
                    value={editProduct.image_url || ""}
                    onChange={(e) => setEditProduct({ ...editProduct, image_url: e.target.value })}
                    placeholder="Image URL or upload"
                    className="flex-1"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Max 3MB per image</p>
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
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-5">
                {saveMutation.isPending ? "Saving..." : "Save Product"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
