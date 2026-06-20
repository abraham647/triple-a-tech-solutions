import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, MessageSquare } from "lucide-react";
import ProductInquiryDialog from "./ProductInquiryDialog";

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

export const ProductCard = ({ product, onInquire }: { product: any; onInquire: (p: any) => void }) => {
  const stock = stockLabel[product.stock_status] || stockLabel.in_stock;
  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden flex flex-col glow-card glow-card-hover transition-all duration-300 hover:border-primary/30">
      <div className="relative h-48 bg-secondary/40 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Package className="w-12 h-12 text-muted-foreground" />
        )}
        <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${stock.cls}`}>{stock.text}</span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">{product.category}</span>
        <h3 className="font-display font-semibold text-foreground mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{product.description}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display font-bold text-primary">{formatPrice(Number(product.price))}</span>
          <Button size="sm" onClick={() => onInquire(product)} className="rounded-xl">
            <MessageSquare className="w-4 h-4 mr-1" /> Inquire
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProductsSection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [inquiry, setInquiry] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("display_order")
        .limit(6);
      if (data) setProducts(data);
    };
    load();
  }, []);

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
