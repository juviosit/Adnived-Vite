import { Helmet } from "react-helmet-async";

const SITE_URL = "https://kindred-vision-craft.lovable.app";
const SITE_NAME = "adnivedAnalytics";
const DEFAULT_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1d7bb8eb-1765-490d-a45d-d13209e57446/id-preview-bdd38c8d--ada4088c-db9f-47e8-b3e6-0f6448b77910.lovable.app-1771949999132.png";

type SEOProps = {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  image?: string;
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
};

const SEO = ({
  title,
  description,
  path = "/",
  type = "website",
  image = DEFAULT_IMAGE,
  jsonLd,
  noindex = false,
}: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;

  const defaultJsonLd = path === "/"
    ? {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        description,
        logo: `${SITE_URL}/favicon.ico`,
        sameAs: [],
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        url,
        description,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd ?? defaultJsonLd)}
      </script>
    </Helmet>
  );
};

export default SEO;
