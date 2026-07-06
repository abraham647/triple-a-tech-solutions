import { defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import listTestimonialsTool from "./tools/list-testimonials";
import submitProductInquiryTool from "./tools/submit-product-inquiry";

export default defineMcp({
  name: "triple-a-tech-mcp",
  title: "Triple A Tech Solutions MCP",
  version: "0.1.0",
  instructions:
    "Tools for Triple A Tech Solutions, a Kenyan security & tech company. Use `list_products` to browse security products, `list_testimonials` for customer reviews, and `submit_product_inquiry` to send a quote request.",
  tools: [listProductsTool, listTestimonialsTool, submitProductInquiryTool],
});
