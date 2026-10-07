import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import BuyDialog from "@/components/BuyDialog";
import ProductInquiryDialog from "@/components/ProductInquiryDialog";
import { Button } from "@/components/ui/button";
import { formatPrice, getGallery, stockLabel } from "@/components/ProductsSection";
import { cart } from "@/hooks/useCart";
import DeliveryInfo from "@/components/DeliveryInfo";
import { toast } from "sonner";
import { useProduct, useRelatedProducts } from "@/hooks/usePublicData";
import { ChevronLeft, ChevronRight, Minus, Plus, Package, ShoppingCart, MessageSquare, Truck, ArrowLeft } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: related } = useRelatedProducts(product);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [buyOpen, setBuyOpen] = useState(false);
  const [inqOpen, setInqOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setActive(0); setQty(1); window.scrollTo({ top: 0 }); }, [id]);

  const gallery = product ? getGallery(product) : [];
  const stock = product ? stockLabel[product.stock_status] || stockLabel.in_stock : null;
  const canBuy = product && Number(product.price) > 0 && product.stock_status !== "out_of_stock";
  const scroll = (dir: number) => rowRef.current?.scrollBy({ left: dir * rowRef.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <>
      {product && (
        <SEO
          title={`${product.name} | Triple A Tech Solutions`}
          description={(product.description || `Buy ${product.name} in Kenya`).slice(0, 155)}
          path={`/products/${product.id}`}
        />
      )}
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen">
        <div className="container px-4">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to products
          </Link>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-10 animate-pulse">
              <div className="aspect-square rounded-xl bg-secondary/60" />
              <div className="space-y-4"><div className="h-8 w-2/3 bg-secondary/60 rounded" /><div className="h-6 w-1/3 bg-secondary/60 rounded" /></div>
            </div>
          ) : !product ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">This product isn't available.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <div className="relative aspect-square rounded-xl border border-border bg-card overflow-hidden flex items-center justify-center">
                  {gallery[active] ? (
                    <img src={gallery[active]} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <Package className="w-16 h-16 text-muted-foreground" />
                  )}
                  {gallery.length > 1 && (
                    <>
                      <button aria-label="Previous photo" onClick={() => setActive(a => (a - 1 + gallery.length) % gallery.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
                      <button aria-label="Next photo" onClick={() => setActive(a => (a + 1) % gallery.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center"><ChevronRight className="w-5 h-5" /></button>
                    </>
                  )}
                </div>
                {gallery.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {gallery.map((img, i) => (
                      <button key={i} onClick={() => setActive(i)} className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${i === active ? "border-primary" : "border-border"}`}>
                        <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs text-primary font-semibold uppercase tracking-wider">{product.category}</span>
                <h1 className="text-2xl md:text-4xl font-bold font-display mt-1">{product.name}</h1>
                <p className="text-3xl font-display font-bold text-primary mt-4">{formatPrice(Number(product.price))}</p>
                {stock && <span className={`inline-block mt-3 text-xs px-2 py-1 rounded-full ${stock.cls}`}>{stock.text}</span>}
                <div className="border-t border-border my-6" />
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>

                {canBuy && (<>
                  <div className="flex items-center gap-3 mt-8">
                    <div className="flex items-center border border-border rounded-xl h-12">
                      <button aria-label="Decrease" className="px-4 h-full" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus className="w-4 h-4" /></button>
                      <span className="w-8 text-center">{qty}</span>
                      <button aria-label="Increase" className="px-4 h-full" onClick={() => setQty(q => q + 1)}><Plus className="w-4 h-4" /></button>
                    </div>
                    <Button size="lg" variant="outline" className="flex-1 h-12 rounded-xl tracking-widest uppercase" onClick={() => { cart.add({ id: product.id, name: product.name, price: Number(product.price), image: gallery[0] }, qty); toast.success("Added to cart"); }}>
                      <ShoppingCart className="w-4 h-4 mr-2" /> Add to cart
                    </Button>
                  </div>
                  <Button size="lg" className="w-full h-12 rounded-xl glow-primary tracking-widest uppercase mt-3" onClick={() => setBuyOpen(true)}>
                    Buy it now
                  </Button>
                </>)}
                <Button size="lg" variant="outline" className="w-full h-12 rounded-xl mt-3" onClick={() => setInqOpen(true)}>
                  <MessageSquare className="w-4 h-4 mr-2" /> Send an inquiry
                </Button>
                <a
                  href={`https://wa.me/254732695197?text=${encodeURIComponent(`Hi Triple A Tech, I'm interested in: ${product.name}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center w-full h-12 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-medium"
                >
                  Chat on WhatsApp
                </a>
                <DeliveryInfo />
              </div>
            </div>
          )}

          {related && related.length > 0 && (
            <section className="mt-20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-4xl font-bold font-display">You Might Also Like</h2>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="rounded-full" aria-label="Scroll left" onClick={() => scroll(-1)}><ChevronLeft className="w-5 h-5" /></Button>
                  <Button size="icon" variant="outline" className="rounded-full" aria-label="Scroll right" onClick={() => scroll(1)}><ChevronRight className="w-5 h-5" /></Button>
                </div>
              </div>
              <div ref={rowRef} className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none">
                {related.map(r => {
                  const img = getGallery(r)[0];
                  return (
                    <Link key={r.id} to={`/products/${r.id}`} className="snap-start shrink-0 w-[70%] sm:w-[45%] lg:w-[23%] rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors">
                      <div className="aspect-square bg-secondary/30 flex items-center justify-center">
                        {img ? <img src={img} alt={r.name} loading="lazy" className="w-full h-full object-contain" /> : <Package className="w-10 h-10 text-muted-foreground" />}
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-display font-medium line-clamp-2">{r.name}</h3>
                        <p className="text-primary font-semibold mt-1">{formatPrice(Number(r.price))}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      {product && <BuyDialog product={{ ...product, initialQuantity: qty }} open={buyOpen} onClose={() => setBuyOpen(false)} />}
      <ProductInquiryDialog product={product ?? null} open={inqOpen} onClose={() => setInqOpen(false)} />
    </>
  );
};

export default ProductDetail;
