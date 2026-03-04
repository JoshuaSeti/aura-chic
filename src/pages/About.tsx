import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const About = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <CartDrawer />

    <section className="py-20 flex-1">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">Our Story</p>
        <h1 className="font-display text-4xl md:text-5xl font-light mb-8">About SosoFab</h1>
        <div className="space-y-6 font-body text-sm text-muted-foreground leading-relaxed">
          <p>
            SosoFab Lifestyle was born from a passion for curating exceptional fashion pieces that speak 
            to the modern, confident woman. We believe that true elegance lies in the details — the drape of 
            a fabric, the precision of a stitch, the harmony of colors.
          </p>
          <p>
            Each item in our collection is carefully selected from the finest designers and artisans around 
            the world. We source materials that tell a story — rich velvets, supple leathers, and luxurious 
            silks that transform everyday dressing into an art form.
          </p>
          <p>
            Our commitment is to bring you timeless pieces that transcend trends, offering versatility and 
            sophistication for every chapter of your life.
          </p>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default About;
