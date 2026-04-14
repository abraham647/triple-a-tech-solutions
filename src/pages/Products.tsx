import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Search, ShoppingBag, MessageCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  { key: "all", label: "All Products" },
  { key: "cctv", label: "CCTV & Surveillance" },
  { key: "computers", label: "Computers & Laptops" },
  { key: "networking", label: "Networking" },
  { key: "accessories", label: "Accessories" },
  { key: "general", label: "General" },
];

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true).order("display_order");
      if (data) setProducts(data);
    };
    fetch();
  }, []);

  const filtered = products.filter(p => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const inquire = (product: any) => {
    const msg = encodeURIComponent(`Hi, I'm interested in: ${product.name} (KES ${Number(product.price).toLocaleString()}). Please provide more details.`);
    window.open(`https://wa.me/254112860205?text=${msg}`, "_blank");
  };

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="container px-4 text-center relative z-10">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Our Products</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-display mb-6">Security & Tech Products</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Browse our range of CCTV systems, computers, networking equipment, and accessories. Contact us for pricing and availability.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(c => (
                  <Button key={c.key} size="sm" variant={category === c.key ? "default" : "outline"} onClick={() => setCategory(c.key)} className="rounded-xl">
                    {c.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(p => (
                <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all group">
                  <div className="aspect-square bg-secondary/30 overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-primary font-semibold uppercase">{categories.find(c => c.key === p.category)?.label || p.category}</span>
                    <h3 className="font-display font-bold mt-1 text-sm">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-bold text-primary">KES {Number(p.price).toLocaleString()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock_status === "in_stock" ? "bg-primary/20 text-primary" : p.stock_status === "low_stock" ? "bg-yellow-500/20 text-yellow-600" : "bg-destructive/20 text-destructive"}`}>
                        {p.stock_status === "in_stock" ? "In Stock" : p.stock_status === "low_stock" ? "Low Stock" : "Out of Stock"}
                      </span>
                    </div>
                    <Button size="sm" className="w-full mt-3 rounded-xl" onClick={() => inquire(p)}>
                      <MessageCircle className="w-4 h-4 mr-1" /> Inquire via WhatsApp
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No products found. Try a different category or search term.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Products;
