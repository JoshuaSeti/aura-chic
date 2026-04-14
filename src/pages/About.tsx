import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Phone, Mail } from "lucide-react";

const About = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <CartDrawer />

    <section className="py-20 flex-1">
      <div className="container mx-auto px-4 max-w-3xl">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4 text-center">Our Story</p>
        <h1 className="font-display text-4xl md:text-5xl font-light mb-12 text-center">
          About Sosofab Lifestyle
        </h1>

        <div className="space-y-8 font-body text-sm text-muted-foreground leading-relaxed">
          <p>
            At SF Studios, we redefine beauty standards through precision, creativity, and exceptional service. Our premier luxury beauty studio and salon in Port Elizabeth, South Africa, offers a curated experience tailored to your unique style.
          </p>

          <div>
            <h2 className="font-display text-2xl font-light text-foreground mb-4">Our Story</h2>
            <p>
              Founded in 2006 by Nangamso Tobela, a renowned fashion designer, hairstylist, and entrepreneur, Sosofab has evolved into a lifestyle brand that celebrates individuality and self-expression. Our Sosofab BOUTIQUE offers timeless, fashion-forward, affordable clothing for plus-size women, while SF Studios provides expert beauty services.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-light text-foreground mb-4">Our Salon Experience</h2>
            <p className="mb-3">Our team of experts specializes in:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5 list-disc">
              <li>Wig installations & customization</li>
              <li>Nail services</li>
              <li>Professional makeup</li>
              <li>Ponytails (Pondo)</li>
              <li>Braiding & freehand styles</li>
              <li>Wig washing, maintenance & revamps</li>
            </ul>
            <p className="mt-4">
              We source mid-range to top-quality hair products to cater to your unique needs, ensuring you look and feel your best.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-light text-foreground mb-4">Our Promise</h2>
            <p>
              At SF Studios, we're committed to delivering exceptional service, empowering you to own your beauty and confidence. Join us in redefining elegance and sophistication.
            </p>
          </div>

          <div className="border-t border-border pt-8 mt-8">
            <h2 className="font-display text-2xl font-light text-foreground mb-4">Contact Us</h2>
            <div className="space-y-3">
              <a href="tel:0825220685" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                <span>082 522 0685</span>
              </a>
              <a href="mailto:Sosofablifestyle@gmail.com" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                <span>Sosofablifestyle@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default About;
