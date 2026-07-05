import { Helmet } from "react-helmet-async";

const BASE_URL = "https://triple-a-tech-solutions.lovable.app";

export interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  noIndex?: boolean;
}

const DEFAULT_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/koAH6wURjTa4sfnCnF7cqbMciMl1/social-images/social-1775828308624-TATS_n.webp";

const SEO = ({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
  structuredData,
  noIndex = false,
}: SEOProps) => {
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
