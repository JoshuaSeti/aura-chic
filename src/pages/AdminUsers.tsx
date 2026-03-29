import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Trash2, UserPlus, Shield, ShieldCheck } from "lucide-react";
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
  role: string;
}

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState<string>("admin");

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

  const { data: callerRole } = useQuery({
    queryKey: ["caller-role"],
    queryFn: () => callManageAdmin({ action: "caller_role" }).then((d) => d.role as string),
  });

  const isSuperAdmin = callerRole === "super_admin";

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

  const createAccount = useMutation({
    mutationFn: () => callManageAdmin({ action: "create", email: newEmail, password: newPassword, full_name: newFullName, role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Account created successfully");
      setCreateDialogOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewFullName("");
      setNewRole("admin");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    addAdmin.mutate(email.trim());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword.trim()) return;
    createAccount.mutate();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Admin Users</h1>
        {isSuperAdmin && (
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-primary text-primary-foreground font-body text-xs tracking-wider uppercase">
            <UserPlus className="mr-2 h-4 w-4" /> Create Account
          </Button>
        )}
      </div>

      {/* Add existing user as admin */}
      {isSuperAdmin && (
        <>
          <form onSubmit={handleAdd} className="flex gap-3 mb-4 max-w-md">
            <Input
              type="email"
              placeholder="Promote existing user to admin..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="font-body"
              required
            />
            <Button type="submit" disabled={addAdmin.isPending} className="font-body tracking-wider uppercase text-xs shrink-0">
              <Shield className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </form>
          <p className="font-body text-xs text-muted-foreground mb-4">
            The user must have an existing account before being promoted to admin.
          </p>
        </>
      )}

      {!isSuperAdmin && (
        <p className="font-body text-sm text-muted-foreground mb-4">
          Only super admins can add or remove admin accounts.
        </p>
      )}

      <div className="bg-card rounded border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-body text-xs tracking-wider uppercase">Email</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Role</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Joined</TableHead>
              {isSuperAdmin && <TableHead className="font-body text-xs tracking-wider uppercase w-20">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 4 : 3} className="text-center font-body text-muted-foreground py-8">Loading...</TableCell>
              </TableRow>
            ) : admins?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 4 : 3} className="text-center font-body text-muted-foreground py-8">No admins found</TableCell>
              </TableRow>
            ) : admins?.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-body text-sm">{admin.email}</TableCell>
                <TableCell>
                  <Badge variant={admin.role === "super_admin" ? "default" : "secondary"} className="gap-1">
                    {admin.role === "super_admin" ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                    {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                  </Badge>
                </TableCell>
                <TableCell className="font-body text-xs text-muted-foreground">
                  {format(new Date(admin.created_at), "MMM d, yyyy")}
                </TableCell>
                {isSuperAdmin && (
                  <TableCell>
                    {admin.role !== "super_admin" && (
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
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Account Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Create Admin Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="font-body text-xs tracking-wider uppercase block mb-1">Full Name</label>
              <Input value={newFullName} onChange={(e) => setNewFullName(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="font-body text-xs tracking-wider uppercase block mb-1">Email *</label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" required />
            </div>
            <div>
              <label className="font-body text-xs tracking-wider uppercase block mb-1">Password *</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" required minLength={8} />
            </div>
            <div>
              <label className="font-body text-xs tracking-wider uppercase block mb-1">Account Type</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Both have the same permissions, but only Super Admins can add/remove other admins.</p>
            </div>
            <Button type="submit" disabled={createAccount.isPending} className="w-full bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-5">
              {createAccount.isPending ? "Creating..." : "Create Account"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
