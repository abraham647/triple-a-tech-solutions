import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Cached read hooks for public site content.
 *
 * Every one of these tables is read-mostly marketing/catalog data, so we cache
 * aggressively in memory. Under heavy concurrent traffic this collapses what
 * used to be one database round-trip per visitor per component into a single
 * query per cache window per browser tab.
 */

// Content that changes rarely — cache for 10 minutes.
const LONG = 10 * 60 * 1000;
// Catalog data — cache for 2 minutes so stock/price edits appear quickly.
const SHORT = 2 * 60 * 1000;

const sel = (s: string): string => s;

export const useServices = () =>
  useQuery({
    queryKey: ["services"],
    staleTime: LONG,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select(sel("id, icon, title, description, category, display_order"))
        .order("display_order")
        .returns<any[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

export const useWhyUsCards = () =>
  useQuery({
    queryKey: ["why_us_cards"],
    staleTime: LONG,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("why_us_cards")
        .select(sel("id, icon, title, description, display_order"))
        .order("display_order")
        .returns<any[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

export const usePortfolioWorks = () =>
  useQuery({
    queryKey: ["portfolio_works"],
    staleTime: LONG,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_works")
        .select(sel("id, title, description, image_url, video_url, external_url, display_order"))
        .order("display_order")
        .returns<any[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

export const useApprovedTestimonials = () =>
  useQuery({
    queryKey: ["testimonials", "approved"],
    staleTime: LONG,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select(sel("name, role, content, rating"))
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<any[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

export const useTeamMembers = () =>
  useQuery({
    queryKey: ["team_members"],
    staleTime: LONG,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select(sel("id, name, role, bio, photo_url, category, display_order"))
        .eq("is_visible", true)
        .order("display_order")
        .returns<any[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

export const useAboutSections = () =>
  useQuery({
    queryKey: ["about_sections"],
    staleTime: LONG,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_sections")
        .select(sel("id, section_type, title, content, image_url, display_order"))
        .eq("is_visible", true)
        .order("display_order")
        .returns<any[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

/** Small set of products for the homepage teaser. */
export const useFeaturedProducts = (limit = 6) =>
  useQuery({
    queryKey: ["products", "featured", limit],
    staleTime: SHORT,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(sel("id, name, description, category, price, image_url, images, stock_status, display_order"))
        .eq("is_active", true)
        .order("display_order")
        .limit(limit)
        .returns<any[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

/** Distinct categories, fetched without pulling the whole catalog down. */
export const useProductCategories = () =>
  useQuery({
    queryKey: ["products", "categories"],
    staleTime: LONG,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(sel("category"))
        .eq("is_active", true)
        .returns<{ category: string }[]>();
      if (error) throw error;
      const unique = new Map<string, string>();
      for (const row of data ?? []) {
        const label = row.category?.trim();
        if (label && !unique.has(label.toLocaleLowerCase())) {
          unique.set(label.toLocaleLowerCase(), label);
        }
      }
      return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
    },
  });

export interface ProductPageParams {
  page: number;
  pageSize: number;
  category: string;
  search: string;
}

/**
 * Server-side paginated + filtered product listing. Only the current page of
 * rows crosses the wire, so a 10,000-product catalog costs the same as a
 * 20-product one for each visitor.
 */
export const useProductsPage = ({ page, pageSize, category, search }: ProductPageParams) =>
  useQuery({
    queryKey: ["products", "page", page, pageSize, category, search],
    staleTime: SHORT,
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let q = supabase
        .from("products")
        .select(sel("id, name, description, category, price, image_url, images, stock_status, display_order"), {
          count: "exact",
        })
        .eq("is_active", true);

      if (category !== "all") q = q.ilike("category", category.trim());
      if (search.trim()) {
        // PostgREST's `or` filter treats punctuation as syntax, so strip those
        // characters before composing a safe, multi-field catalog search.
        const safeSearch = search.trim().replace(/[,%()."\\]/g, " ").replace(/\s+/g, " ");
        if (safeSearch) {
          const term = `%${safeSearch}%`;
          q = q.or(`name.ilike.${term},description.ilike.${term},category.ilike.${term}`);
        }
      }

      const { data, error, count } = await q.order("display_order").range(from, to).returns<any[]>();
      if (error) throw error;
      return { rows: data ?? [], total: count ?? 0 };
    },
  });
