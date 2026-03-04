import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [editCat, setEditCat] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (cat: any) => {
      if (cat.id) {
        const { error } = await supabase.from("categories").update(cat).eq("id", cat.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(cat);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setDialogOpen(false);
      toast.success("Category saved");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Categories</h1>
        <Button onClick={() => { setEditCat({ name: "", slug: "", description: "" }); setDialogOpen(true); }} className="bg-primary text-primary-foreground font-body text-xs tracking-wider uppercase">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="bg-card rounded border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-body text-xs tracking-wider uppercase">Name</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Slug</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Description</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center font-body text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : categories?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-body text-sm">{c.name}</TableCell>
                <TableCell className="font-body text-xs text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="font-body text-sm text-muted-foreground truncate max-w-xs">{c.description || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditCat(c); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editCat?.id ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          {editCat && (
            <div className="space-y-4">
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Name</label>
                <Input value={editCat.name} onChange={(e) => setEditCat({ ...editCat, name: e.target.value })} />
              </div>
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Slug</label>
                <Input value={editCat.slug} onChange={(e) => setEditCat({ ...editCat, slug: e.target.value })} />
              </div>
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Description</label>
                <Textarea value={editCat.description || ""} onChange={(e) => setEditCat({ ...editCat, description: e.target.value })} />
              </div>
              <Button onClick={() => saveMutation.mutate(editCat)} disabled={saveMutation.isPending} className="w-full bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-5">
                {saveMutation.isPending ? "Saving..." : "Save Category"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
