import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BuyDialog from "@/components/BuyDialog";
import DeliveryInfo from "@/components/DeliveryInfo";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/ProductsSection";
import { cart, useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2, Package, ShoppingCart } from "lucide-react";

const Cart = () => {
  const { items, total, count } = useCart();
  const [checkout, setCheckout] = useState(false);

  // The whole cart is checked out as one order with the combined total.
  const orderProduct = {
    id: items.length === 1 ? items[0].id : null,
    name: items.map(i => `${i.quantity}× ${i.name}`).join(", ").slice(0, 250),
    price: total,
    initialQuantity: 1,
    isCart: true,
  };

  return (
    <>
      <SEO title="Your Cart | Triple A Tech Solutions" description="Review the items in your cart and check out." path="/cart" />
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen">
        <div className="container px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-8">Your Cart</h1>
          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-6">Your cart is empty.</p>
              <Button asChild><Link to="/products">Browse products</Link></Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-[1fr_300px] gap-8">
              <div className="space-y-4">
                {items.map(i => (
                  <div key={i.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                    <Link to={`/products/${i.id}`} className="w-20 h-20 rounded-lg bg-secondary/40 overflow-hidden flex items-center justify-center shrink-0">
                      {i.image ? <img src={i.image} alt={i.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-muted-foreground" />}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${i.id}`} className="font-medium hover:text-primary line-clamp-2">{i.name}</Link>
                      <p className="text-primary font-semibold mt-1">{formatPrice(i.price)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-border rounded-lg h-9">
                          <button aria-label="Decrease" className="px-3 h-full" onClick={() => cart.setQty(i.id, i.quantity - 1)}><Minus className="w-3 h-3" /></button>
                          <span className="w-6 text-center text-sm">{i.quantity}</span>
                          <button aria-label="Increase" className="px-3 h-full" onClick={() => cart.setQty(i.id, i.quantity + 1)}><Plus className="w-3 h-3" /></button>
                        </div>
                        <button aria-label="Remove" onClick={() => cart.remove(i.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <aside className="p-5 rounded-xl border border-border bg-card h-fit">
                <div className="flex justify-between text-sm text-muted-foreground"><span>Items</span><span>{count}</span></div>
                <div className="flex justify-between font-display font-bold text-lg mt-2"><span>Total</span><span className="text-primary">{formatPrice(total)}</span></div>
                <Button className="w-full mt-5 h-11 rounded-xl glow-primary" onClick={() => setCheckout(true)}>Checkout</Button>
                <DeliveryInfo />
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BuyDialog product={orderProduct} open={checkout} onClose={() => setCheckout(false)} onOrdered={() => cart.clear()} />
    </>
  );
};

export default Cart;
