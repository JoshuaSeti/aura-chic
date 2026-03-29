import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MessageCircle } from "lucide-react";
import { format, getDay } from "date-fns";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const generateTimeSlots = (start: string, end: string): string[] => {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let h = sh, m = sm;
  while (h < eh || (h === eh && m <= em)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) { h++; m = 0; }
  }
  return slots;
};

const Services = () => {
  const [bookingService, setBookingService] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [bookingTime, setBookingTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("created_at");
      return data || [];
    },
  });

  // Filter out expired limited-time services
  const activeServices = useMemo(() => {
    const now = new Date();
    return (services || []).filter((s: any) => {
      if (!s.is_limited_time) return true;
      if (s.limited_time_start && new Date(s.limited_time_start) > now) return false;
      if (s.limited_time_end && new Date(s.limited_time_end) < now) return false;
      return true;
    });
  }, [services]);

  const timeSlots = useMemo(() => {
    if (!bookingService) return [];
    return generateTimeSlots(
      bookingService.available_start_time || "09:00",
      bookingService.available_end_time || "17:00"
    );
  }, [bookingService]);

  const isDateDisabled = (date: Date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
    if (!bookingService) return false;
    const dayName = DAY_NAMES[getDay(date)];
    const availDays: string[] = bookingService.available_days || DAY_NAMES;
    return !availDays.includes(dayName);
  };

  const handleBook = async () => {
    if (!bookingDate || !bookingTime || !customerName || !customerEmail) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("service_bookings").insert({
      service_id: bookingService.id,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || null,
      booking_date: format(bookingDate, "yyyy-MM-dd"),
      booking_time: bookingTime,
      notes: notes || null,
    });
    if (error) {
      toast.error("Booking failed: " + error.message);
    } else {
      toast.success("Booking submitted! We'll confirm shortly.");
      setBookingService(null);
      setBookingDate(undefined);
      setBookingTime("");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setNotes("");
    }
    setSubmitting(false);
  };

  const openWhatsApp = (serviceName: string) => {
    const message = encodeURIComponent(`Hi! I'd like to inquire about the "${serviceName}" service.`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />

      <section className="bg-linen py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-2">What We Offer</p>
          <h1 className="font-display text-4xl md:text-5xl font-light">Our Services</h1>
          <p className="font-body text-sm text-muted-foreground mt-4 max-w-lg mx-auto">
            Book a session with our experts. From styling to consultations, we're here to elevate your experience.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background flex-1">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <p className="text-center font-body text-muted-foreground">Loading services...</p>
          ) : activeServices.length === 0 ? (
            <p className="text-center font-body text-muted-foreground">No services available at the moment.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeServices.map((service: any) => (
                <div key={service.id} className="bg-card border border-border rounded-lg overflow-hidden group">
                  {service.image_url ? (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      <span className="font-body text-muted-foreground text-sm">No image</span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-display text-xl mb-2">{service.name}</h3>
                    {service.description && (
                      <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-3">{service.description}</p>
                    )}
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-body text-lg font-semibold">{formatPrice(service.price)}</span>
                      <span className="font-body text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {service.duration_minutes} min
                      </span>
                    </div>
                    {service.is_limited_time && (
                      <Badge variant="outline" className="mb-3 text-xs">Limited Time Offer</Badge>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => { setBookingService(service); setBookingDate(undefined); setBookingTime(""); }}
                        className="flex-1 bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-5 hover:bg-primary/90"
                      >
                        Book Now
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openWhatsApp(service.name)}
                        className="border-foreground"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Dialog */}
      <Dialog open={!!bookingService} onOpenChange={(open) => !open && setBookingService(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Book: {bookingService?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="font-body text-xs tracking-wider uppercase block mb-1">Full Name *</label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <label className="font-body text-xs tracking-wider uppercase block mb-1">Email *</label>
              <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <div>
              <label className="font-body text-xs tracking-wider uppercase block mb-1">Phone</label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Your phone number" />
            </div>
            <div>
              <label className="font-body text-xs tracking-wider uppercase block mb-1">Date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !bookingDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bookingDate ? format(bookingDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={bookingDate}
                    onSelect={setBookingDate}
                    disabled={isDateDisabled}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="font-body text-xs tracking-wider uppercase block mb-1">Time *</label>
              <Select value={bookingTime} onValueChange={setBookingTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-body text-xs tracking-wider uppercase block mb-1">Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests..." />
            </div>
            <Button
              onClick={handleBook}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-5 hover:bg-primary/90"
            >
              {submitting ? "Submitting..." : "Confirm Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Services;
