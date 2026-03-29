import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

const MAX_FILE_SIZE = 3 * 1024 * 1024;

const AdminServices = () => {
  const queryClient = useQueryClient();
  const [editService, setEditService] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleImageUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) { toast.error("Image must be under 3MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("File must be an image"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("service-images").upload(fileName, file);
    if (error) { toast.error("Upload failed: " + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("service-images").getPublicUrl(fileName);
    setEditService((prev: any) => ({ ...prev, image_url: urlData.publicUrl }));
    toast.success("Image uploaded");
    setUploading(false);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-services"] }); toast.success("Service deleted"); },
  });

  const saveMutation = useMutation({
    mutationFn: async (service: any) => {
      if (service.id) {
        const { error } = await supabase.from("services").update(service).eq("id", service.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert(service);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      setDialogOpen(false);
      setEditService(null);
      toast.success("Service saved");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openNew = () => {
    setEditService({ name: "", slug: "", description: "", price: 0, duration_minutes: 60, image_url: "", active: true });
    setDialogOpen(true);
  };

  const openEdit = (s: any) => { setEditService({ ...s }); setDialogOpen(true); };

  const handleSave = () => {
    if (uploading) { toast.error("Wait for image upload"); return; }
    const payload: any = {
      name: editService.name,
      slug: editService.slug,
      description: editService.description || null,
      price: editService.price,
      duration_minutes: editService.duration_minutes,
      image_url: editService.image_url || null,
      active: editService.active,
    };
    if (editService.id) payload.id = editService.id;
    saveMutation.mutate(payload);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Services</h1>
        <Button onClick={openNew} className="bg-primary text-primary-foreground font-body text-xs tracking-wider uppercase">
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      <div className="bg-card rounded border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-body text-xs tracking-wider uppercase">Name</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Price</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Duration</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Active</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center font-body text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : services?.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell className="font-body text-sm">{s.name}</TableCell>
                <TableCell className="font-body text-sm">{formatPrice(s.price)}</TableCell>
                <TableCell className="font-body text-sm">{s.duration_minutes} min</TableCell>
                <TableCell><span className={`font-body text-xs ${s.active ? "text-green-600" : "text-destructive"}`}>{s.active ? "Yes" : "No"}</span></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
            <DialogTitle className="font-display text-xl">{editService?.id ? "Edit Service" : "New Service"}</DialogTitle>
          </DialogHeader>
          {editService && (
            <div className="space-y-4">
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Name</label>
                <Input value={editService.name} onChange={(e) => setEditService({ ...editService, name: e.target.value })} />
              </div>
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Slug</label>
                <Input value={editService.slug} onChange={(e) => setEditService({ ...editService, slug: e.target.value })} />
              </div>
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Description</label>
                <Textarea value={editService.description || ""} onChange={(e) => setEditService({ ...editService, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs tracking-wider uppercase block mb-1">Price (R)</label>
                  <Input type="number" step="0.01" value={editService.price} onChange={(e) => setEditService({ ...editService, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="font-body text-xs tracking-wider uppercase block mb-1">Duration (min)</label>
                  <Input type="number" value={editService.duration_minutes} onChange={(e) => setEditService({ ...editService, duration_minutes: parseInt(e.target.value) || 60 })} />
                </div>
              </div>
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Service Image</label>
                {editService.image_url && (
                  <img src={editService.image_url} alt="Preview" className="w-20 h-20 object-cover rounded mb-2 border border-border" />
                )}
                <div className="flex gap-2">
                  <Input value={editService.image_url || ""} onChange={(e) => setEditService({ ...editService, image_url: e.target.value })} placeholder="Image URL or upload" className="flex-1" />
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); e.target.value = ""; }} />
                  <Button type="button" variant="outline" size="icon" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Max 3MB per image</p>
              </div>
              <label className="flex items-center gap-2 font-body text-sm">
                <Switch checked={editService.active} onCheckedChange={(v) => setEditService({ ...editService, active: v })} />
                Active
              </label>
              <Button onClick={handleSave} disabled={saveMutation.isPending || uploading} className="w-full bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-5">
                {uploading ? "Uploading..." : saveMutation.isPending ? "Saving..." : "Save Service"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServices;
