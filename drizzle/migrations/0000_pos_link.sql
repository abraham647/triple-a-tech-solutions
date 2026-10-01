ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer, ADD COLUMN IF NOT EXISTS barcode text;
CREATE UNIQUE INDEX IF NOT EXISTS products_barcode_key ON public.products(barcode) WHERE barcode IS NOT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'website', ADD COLUMN IF NOT EXISTS pos_sale_id text;
CREATE UNIQUE INDEX IF NOT EXISTS orders_pos_sale_id_key ON public.orders(pos_sale_id) WHERE pos_sale_id IS NOT NULL;