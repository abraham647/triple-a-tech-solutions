import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, MessageSquare, Images, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProductInquiryDialog from "./ProductInquiryDialog";
import BuyDialog from "./BuyDialog";


export const formatPrice = (price: number) =>
  price && price > 0
    ? new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(price)
    : "Contact for price";

export const stockLabel: Record<string, { text: string; cls: string }> = {
  in_stock: { text: "In Stock", cls: "bg-accent/20 text-accent" },
  low_stock: { text: "Low Stock", cls: "bg-yellow-500/20 text-yellow-600" },
  out_of_stock: { text: "Out of Stock", cls: "bg-destructive/20 text-destructive" },
  preorder: { text: "Pre-order", cls: "bg-primary/20 text-primary" },
};

export const getGallery = (product: any): string[] => {
  const extra = Array.isArray(product.images) ? product.images : [];
  return Array.from(new Set([product.image_url, ...extra].filter(Boolean)));
};

export const ProductCard = ({ product, onInquire }: { product: any; onInquire: (p: any) => void }) => {
  const stock = stockLabel[product.stock_status] || stockLabel.in_stock;
  const gallery = getGallery(product);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [active, setActive] = useState(0);


  const openGallery = (i = 0) => { if (gallery.length === 0) return; setActive(i); setGalleryOpen(true); };
  const prev = () => setActive(a => (a - 1 + gallery.length) % gallery.length);
  const next = () => setActive(a => (a + 1) % gallery.length);

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden flex flex-col glow-card glow-card-hover transition-all duration-300 hover:border-primary/30">
      <div className="relative h-48 bg-secondary/40 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => openGallery(0)}>
        {gallery[0] ? (
          <img src={gallery[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Package className="w-12 h-12 text-muted-foreground" />
        )}
        <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${stock.cls}`}>{stock.text}</span>
        {gallery.length > 1 && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-black/60 text-white">
            <Images className="w-3 h-3" /> {gallery.length} photos
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">{product.category}</span>
        <h3 className="font-display font-semibold text-foreground mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{product.description}</p>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-display font-bold text-primary">{formatPrice(Number(product.price))}</span>
          <Button size="sm" variant="outline" onClick={() => onInquire(product)} className="rounded-xl">
            <MessageSquare className="w-4 h-4 mr-1" /> Inquire
          </Button>
        </div>
        {Number(product.price) > 0 && product.stock_status !== "out_of_stock" && (
          <Button size="sm" onClick={() => setBuyOpen(true)} className="w-full rounded-xl glow-primary mb-2 h-9">
            <ShoppingCart className="w-4 h-4 mr-1.5" /> Buy Now
          </Button>
        )}

        <a
          href={`https://wa.me/254732695197?text=${encodeURIComponent(`Hi Triple A Tech, I'm interested in: ${product.name}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-colors h-9 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Chat on WhatsApp
        </a>
      </div>

      {/* Kilimall-style image gallery modal */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <div className="relative bg-black flex items-center justify-center aspect-square sm:aspect-video">
            {gallery[active] && <img src={gallery[active]} alt={`${product.name} ${active + 1}`} className="max-h-full max-w-full object-contain" />}
            {gallery.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center"><ChevronRight className="w-5 h-5" /></button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded-full bg-black/60 text-white">{active + 1} / {gallery.length}</span>
              </>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-display font-semibold mb-1">{product.name}</h3>
            <p className="font-display font-bold text-primary mb-3">{formatPrice(Number(product.price))}</p>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${i === active ? "border-primary" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BuyDialog product={product} open={buyOpen} onClose={() => setBuyOpen(false)} />
    </div>

  );
};

const ProductsSection = () => {
  const navigate = useNavigate();
  const { data } = useFeaturedProducts(6);
  const products = data ?? [];
  const [inquiry, setInquiry] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  if (products.length === 0) return null;

  const openInquiry = (p: any) => { setInquiry(p); setOpen(true); };

  return (
    <section id="products" className="py-20 md:py-28 relative">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-accent/3 blur-3xl" />
      <div className="container px-4 relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Shop Our Products</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display">Security & Tech Products</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Quality CCTV, computers, and security hardware — browse and send an inquiry.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} onInquire={openInquiry} />)}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" onClick={() => { navigate("/products"); window.scrollTo({ top: 0 }); }} className="rounded-xl">
            View All Products <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <ProductInquiryDialog product={inquiry} open={open} onClose={() => setOpen(false)} />
    </section>
  );
};

export default ProductsSection;
