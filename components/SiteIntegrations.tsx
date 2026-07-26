import Script from "next/script";
import { ensureDbReady, getSettings } from "@/lib/db";

function sanitizeId(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "");
}

/** GA / GTM / custom tracking snippets from Admin → Site Settings. */
export default async function SiteIntegrations() {
  await ensureDbReady();
  const s = getSettings();
  const ga4 = sanitizeId((s.ga4_measurement_id || "").trim());
  const gtm = sanitizeId((s.gtm_container_id || "").trim());
  const customHead = (s.custom_head_html || "").trim();

  return (
    <>
      {gtm ? (
        <Script id="certko-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      ) : null}

      {ga4 && !gtm ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
            strategy="afterInteractive"
          />
          <Script id="certko-ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`}
          </Script>
        </>
      ) : null}

      {customHead ? (
        <Script id="certko-custom-head" strategy="afterInteractive">
          {`(function(){try{var t=${JSON.stringify(customHead)};var r=document.createRange();var f=r.createContextualFragment(t);document.head.appendChild(f);}catch(e){console && console.warn && console.warn('Certko custom head HTML failed', e);}})();`}
        </Script>
      ) : null}
    </>
  );
}

export async function SiteIntegrationsBody() {
  await ensureDbReady();
  const s = getSettings();
  const gtm = sanitizeId((s.gtm_container_id || "").trim());
  const customBody = (s.custom_body_html || "").trim();

  return (
    <>
      {gtm ? (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
      ) : null}
      {customBody ? (
        <div
          id="certko-custom-body"
          dangerouslySetInnerHTML={{ __html: customBody }}
          suppressHydrationWarning
        />
      ) : null}
    </>
  );
}
