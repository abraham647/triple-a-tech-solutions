ALTER TABLE public.products
  ADD COLUMN cost_price numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN reorder_level integer;

COMMENT ON COLUMN public.products.cost_price IS 'Supplier/buy cost in KES for margin reporting';
COMMENT ON COLUMN public.products.reorder_level IS 'Stock level at which the product should be reordered';