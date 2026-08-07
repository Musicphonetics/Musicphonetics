"use client";

import Script from "next/script";

// Loads whichever analytics/ads tags are configured, and auto-tracks every
// outbound WhatsApp / call / email click as a conversion. All inert until you
// set the IDs as build env vars in Cloudflare Pages:
//   NEXT_PUBLIC_GA_ID          Google Analytics 4   (G-XXXXXXXX)
//   NEXT_PUBLIC_GOOGLE_ADS_ID  Google Ads           (AW-XXXXXXXXX)
//   NEXT_PUBLIC_META_PIXEL_ID  Meta / Facebook Pixel (numeric id)
const GA = process.env.NEXT_PUBLIC_GA_ID;
const ADS = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function Analytics() {
  const gtagId = GA || ADS;
  return (
    <>
      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html:
            `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());`
            + (GA ? `gtag('config','${GA}');` : "")
            + (ADS ? `gtag('config','${ADS}');` : "") }} />
        </>
      )}

      {PIXEL && (
        <Script id="fb-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html:
          `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');` }} />
      )}

      {/* Auto-track outbound contact clicks site-wide, no per-button wiring needed. */}
      <Script id="mp-autotrack" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html:
        `(function(){function ev(n,p){try{if(window.gtag)gtag('event',n,p||{});}catch(e){}}`
        + `document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a'):null;if(!a||!a.href)return;var h=a.href;`
        + `if(/wa\\.me|api\\.whatsapp|web\\.whatsapp/i.test(h)){ev('contact_whatsapp',{method:'whatsapp'});try{if(window.fbq)fbq('track','Contact');}catch(e){}}`
        + `else if(/^tel:/i.test(h)){ev('contact_call',{method:'phone'});try{if(window.fbq)fbq('track','Contact');}catch(e){}}`
        + `else if(/^mailto:/i.test(h)){ev('contact_email',{method:'email'});}`
        + `},true);})();` }} />
    </>
  );
}
