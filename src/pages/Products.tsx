import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package } from "lucide-react";
import { ProductCard } from "@/components/ProductsSection";
import ProductInquiryDialog from "@/components/ProductInquiryDialog";
import SEO from "@/components/SEO";

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [inquiry, setInquiry] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = "Products | Triple A Tech Solutions";
    const load = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (data) setProducts(data);
      setLoading(false);
    };
    load();
  }, []);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map(p => p.category)))],
    [products]
  );

  const filtered = products.filter(p => {
    const matchCat = category === "all" || p.category === category;
    const matchQuery = !query || (p.name + p.description).toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  const openInquiry = (p: any) => { setInquiry(p); setOpen(true); };

  return (
    <>
      <SEO
        title="Security Products & Equipment | Triple A Tech Solutions"
        description="Browse CCTV cameras, access control, alarms and security equipment from Triple A Tech Solutions. Quality products for homes and businesses in Kenya."
        path="/products"
      />
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen">
        <div className="container px-4">
          <div className="text-center mb-10">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Our Catalog</p>
            <h1 className="text-3xl md:text-5xl font-bold font-display">Security & Tech Products</h1>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Browse our range of CCTV, computers, and security hardware. Found something? Send us an inquiry and we'll get back to you.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..." className="pl-9 rounded-xl h-11" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(c => (
                <Button key={c} size="sm" variant={category === c ? "default" : "outline"} onClick={() => setCategory(c)} className="rounded-xl capitalize">
                  {c}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-20">Loading products...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No products found.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(p => <ProductCard key={p.id} product={p} onInquire={openInquiry} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <ProductInquiryDialog product={inquiry} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default Products;
