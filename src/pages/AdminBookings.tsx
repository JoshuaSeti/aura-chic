import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const AdminBookings = () => {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_bookings")
        .select("*, services(name)")
        .order("booking_date", { ascending: false });
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("service_bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Status updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Service Bookings</h1>
      <div className="bg-card rounded border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-body text-xs tracking-wider uppercase">Service</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Customer</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Date & Time</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Contact</TableHead>
              <TableHead className="font-body text-xs tracking-wider uppercase">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center font-body text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : bookings?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center font-body text-muted-foreground py-8">No bookings yet</TableCell></TableRow>
            ) : bookings?.map((b: any) => (
              <TableRow key={b.id}>
                <TableCell className="font-body text-sm">{b.services?.name || "—"}</TableCell>
                <TableCell>
                  <div className="font-body text-sm">{b.customer_name}</div>
                  {b.notes && <div className="font-body text-xs text-muted-foreground mt-1">{b.notes}</div>}
                </TableCell>
                <TableCell className="font-body text-sm">
                  {format(new Date(b.booking_date), "dd MMM yyyy")} at {b.booking_time}
                </TableCell>
                <TableCell>
                  <div className="font-body text-sm">{b.customer_email}</div>
                  {b.customer_phone && <div className="font-body text-xs text-muted-foreground">{b.customer_phone}</div>}
                </TableCell>
                <TableCell>
                  <Select value={b.status} onValueChange={(v) => updateStatus.mutate({ id: b.id, status: v })}>
                    <SelectTrigger className="w-32">
                      <Badge className={`${statusColor[b.status] || ""} border-0`}>{b.status}</Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminBookings;
