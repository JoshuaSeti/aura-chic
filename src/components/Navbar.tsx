import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/logo.jpeg";

const Navbar = () => {
  const { itemCount, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
    { label: "About", to: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        {/* Mobile menu toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="SosoFab Lifestyle" className="h-10 md:h-14 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="font-body text-sm tracking-widest uppercase text-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
            <User size={20} />
          </Link>
          <button onClick={() => setIsOpen(true)} className="relative text-foreground hover:text-primary transition-colors">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-body font-semibold">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block font-body text-sm tracking-widest uppercase text-foreground hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
