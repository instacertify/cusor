"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  type ConsentPrefs,
  type GdprPublicSettings,
  readConsentFromDocument,
} from "@/lib/gdpr-client";

function sanitizeId(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "");
}

/**
 * Loads GA4 / GTM / custom snippets only after analytics consent
 * (or immediately when admin disables the consent requirement).
 */
export default function AnalyticsGate({
  ga4MeasurementId,
  gtmContainerId,
  customHeadHtml,
  customBodyHtml,
  settings,
}: {
  ga4MeasurementId: string;
  gtmContainerId: string;
  customHeadHtml: string;
  customBodyHtml: string;
  settings: GdprPublicSettings;
}) {
  const [allowed, setAllowed] = useState(() => !settings.requireAnalyticsConsent);

  useEffect(() => {
    function refresh(prefs?: ConsentPrefs | null) {
      if (!settings.requireAnalyticsConsent) {
        setAllowed(true);
        return;
      }
      const c = prefs ?? readConsentFromDocument();
      setAllowed(Boolean(c?.analytics));
    }
    refresh();
    function onConsent(e: Event) {
      const detail = (e as CustomEvent<ConsentPrefs>).detail;
      refresh(detail);
    }
    window.addEventListener("certko:consent", onConsent);
    return () => window.removeEventListener("certko:consent", onConsent);
  }, [settings.requireAnalyticsConsent]);

  if (!allowed) return null;

  const ga4 = sanitizeId(ga4MeasurementId.trim());
  const gtm = sanitizeId(gtmContainerId.trim());
  const customHead = customHeadHtml.trim();
  const customBody = customBodyHtml.trim();

  return (
    <>
      {gtm ? (
        <>
          <Script id="certko-gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
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
