import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Trash2, UserPlus, Shield } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Admin {
  id: string;
  email: string;
  created_at: string;
}

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");

  const callManageAdmin = async (body: Record<string, string>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("manage-admin", {
      body,
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.error) throw new Error(res.error.message);
    if (res.data?.error) throw new Error(res.data.error);
    return res.data;
  };

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => callManageAdmin({ action: "list" }).then((d) => d.admins as Admin[]),
  });

  const addAdmin = useMutation({
    mutationFn: (email: string) => callManageAdmin({ action: "add", email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Admin added successfully");
      setEmail("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeAdmin = useMutation({
    mutationFn: (email: string) => callManageAdmin({ action: "remove", email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Admin removed");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    addAdmin.mutate(email.trim());
  };

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Admin Users</h1>

      {/* Add admin form */}
      <form onSubmit={handleAdd} className="flex gap-3 mb-6 max-w-md">
        <Input
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="font-body"
          required
        />
        <Button type="submit" disabled={addAdmin.isPending} className="font-body tracking-wider uppercase text-xs shrink-0">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </form>

      <p className="font-body text-xs text-muted-foreground mb-4">
        The user must have an existing account before being promoted to admin.
      </p>

      <div className="bg-card rounded border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-body text-xs tracking-wider uppercase">Email</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Role</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Joined</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center font-body text-muted-foreground py-8">Loading...</TableCell>
              </TableRow>
            ) : admins?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center font-body text-muted-foreground py-8">No admins found</TableCell>
              </TableRow>
            ) : admins?.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-body text-sm">{admin.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                </TableCell>
                <TableCell className="font-body text-xs text-muted-foreground">
                  {format(new Date(admin.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display">Remove Admin</AlertDialogTitle>
                        <AlertDialogDescription className="font-body">
                          Remove admin access for <strong>{admin.email}</strong>? They will still have a regular account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeAdmin.mutate(admin.email)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;
