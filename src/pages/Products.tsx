import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductsSection";
import ProductInquiryDialog from "@/components/ProductInquiryDialog";
import SEO from "@/components/SEO";
import { useProductCategories, useProductsPage } from "@/hooks/usePublicData";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const PAGE_SIZE = 24;

const Products = () => {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [inquiry, setInquiry] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const search = useDebouncedValue(query, 350);

  // Any filter change resets to the first page.
  useEffect(() => setPage(0), [category, search]);

  const { data: categoryList } = useProductCategories();
  const { data, isLoading, isFetching } = useProductsPage({
    page,
    pageSize: PAGE_SIZE,
    category,
    search,
  });

  const categories = useMemo(() => ["all", ...(categoryList ?? [])], [categoryList]);
  const products = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openInquiry = (p: any) => {
    setInquiry(p);
    setOpen(true);
  };

  const goToPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Browse our range of CCTV, computers, and security hardware. Found something? Send us an inquiry and we'll get back to you.
            </p>
          </div>

          <div className="mb-8 max-w-5xl mx-auto space-y-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products by name, description or category..."
                aria-label="Search products"
                className="w-full pl-10 h-12 text-base"
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {categories.map(c => (
                <Button
                  key={c.toLocaleLowerCase()}
                  size="sm"
                  variant={category === c ? "default" : "outline"}
                  onClick={() => setCategory(c)}
                  className="capitalize"
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                  <div className="h-48 bg-secondary/60" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-1/3 bg-secondary/60 rounded" />
                    <div className="h-4 w-2/3 bg-secondary/60 rounded" />
                    <div className="h-3 w-full bg-secondary/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No products found.</p>
            </div>
          ) : (
            <>
              <p className="text-center text-muted-foreground text-sm mb-6">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total} product
                {total === 1 ? "" : "s"}
              </p>
              <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
                {products.map(p => (
                  <ProductCard key={p.id} product={p} onInquire={openInquiry} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={page === 0}
                    onClick={() => goToPage(page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-3">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={page + 1 >= totalPages}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
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
