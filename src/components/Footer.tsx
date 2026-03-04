import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpeg";

const Footer = () => (
  <footer className="bg-charcoal text-secondary-foreground py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <img src={logo} alt="SosoFab Lifestyle" className="h-12 mb-4 brightness-150" />
          <p className="font-body text-sm text-secondary-foreground/70 leading-relaxed">
            Curated luxury fashion for the modern woman. Elegance redefined.
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
            <li><a href="#" className="hover:text-gold-light transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-gold-light transition-colors">Shipping</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4">Connect</h4>
          <ul className="space-y-2 font-body text-sm text-secondary-foreground/70">
            <li><a href="#" className="hover:text-gold-light transition-colors">Instagram</a></li>
            <li><a href="#" className="hover:text-gold-light transition-colors">Facebook</a></li>
            <li><a href="#" className="hover:text-gold-light transition-colors">Pinterest</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-secondary/20 mt-12 pt-6 text-center">
        <p className="font-body text-xs text-secondary-foreground/50">
          © 2026 SosoFab Lifestyle. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
