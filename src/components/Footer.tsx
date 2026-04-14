import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const POLICY_LINKS = [
  { key: "shipping_policy", slug: "shipping-policy", label: "Shipping & Collection" },
  { key: "booking_policy", slug: "booking-policy", label: "Booking Policy" },
  { key: "trading_hours", slug: "trading-hours", label: "Trading Hours & Info" },
];

const Footer = () => {
  const { data: visiblePolicies } = useQuery({
    queryKey: ["footer-policy-visibility"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", POLICY_LINKS.map((p) => p.key));
      const visible: string[] = [];
      for (const row of data || []) {
        const val = row.value as any;
        if (val?.visible !== false) visible.push(row.key);
      }
      return visible;
    },
    staleTime: 60000,
  });

  const activePolicies = POLICY_LINKS.filter((p) => visiblePolicies?.includes(p.key));

  return (
    <footer className="bg-charcoal text-secondary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <img src={logo} alt="SosoFab Lifestyle" className="h-12 mb-4 brightness-150" />
            <p className="font-body text-sm text-secondary-foreground/70 leading-relaxed">
              Premier luxury beauty studio & boutique in Port Elizabeth, South Africa. Redefining elegance and sophistication since 2006.
            </p>
          </div>
          <div>
            <h4 className="font-display text-lg mb-4">Shop</h4>
            <ul className="space-y-2 font-body text-sm text-secondary-foreground/70">
              <li><Link to="/shop" className="hover:text-gold-light transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=dresses" className="hover:text-gold-light transition-colors">Dresses</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-gold-light transition-colors">Accessories</Link></li>
              <li><Link to="/shop?category=outerwear" className="hover:text-gold-light transition-colors">Outerwear</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg mb-4">Company</h4>
            <ul className="space-y-2 font-body text-sm text-secondary-foreground/70">
              <li><Link to="/about" className="hover:text-gold-light transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-gold-light transition-colors">Services</Link></li>
              <li><a href="mailto:Sosofablifestyle@gmail.com" className="hover:text-gold-light transition-colors">Contact</a></li>
            </ul>
          </div>
          {activePolicies.length > 0 && (
            <div>
              <h4 className="font-display text-lg mb-4">Policies</h4>
              <ul className="space-y-2 font-body text-sm text-secondary-foreground/70">
                {activePolicies.map((p) => (
                  <li key={p.key}>
                    <Link to={`/policy/${p.slug}`} className="hover:text-gold-light transition-colors">
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="border-t border-secondary/20 mt-12 pt-6 text-center space-y-2">
          <p className="font-body text-xs text-secondary-foreground/50">
            © 2026 SosoFab Lifestyle. All rights reserved.
          </p>
          <Link to="/admin/login" className="font-body text-xs text-secondary-foreground/30 hover:text-secondary-foreground/50 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
