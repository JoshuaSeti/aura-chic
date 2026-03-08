import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-primary/20 text-primary",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-destructive/20 text-destructive",
};

const AdminOrders = () => {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order updated");
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Orders</h1>

      <div className="bg-card rounded border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-body text-xs tracking-wider uppercase">Order</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Customer</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Total</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Status</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center font-body text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : orders?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center font-body text-muted-foreground py-8">No orders yet</TableCell></TableRow>
            ) : orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-body text-xs text-muted-foreground">{order.id.slice(0, 8)}...</TableCell>
                <TableCell>
                  <div>
                    <p className="font-body text-sm">{order.customer_name}</p>
                    <p className="font-body text-xs text-muted-foreground">{order.customer_email}</p>
                  </div>
                </TableCell>
                <TableCell className="font-body text-sm font-semibold">{formatPrice(order.total)}</TableCell>
                <TableCell>
                  <Select value={order.status} onValueChange={(v) => updateStatus.mutate({ id: order.id, status: v })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="font-body text-xs text-muted-foreground">
                  {format(new Date(order.created_at), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminOrders;
