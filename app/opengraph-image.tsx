import { ImageResponse } from "next/og";

export const alt =
  "Musicphonetics — Building the future of music education";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#161B26",
          padding: "72px",
          fontFamily: "serif",
        }}
      >
        {/* Top: brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              border: "2px solid rgba(201,162,39,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C9A227",
              fontSize: "26px",
            }}
          >
            ♪
          </div>
          <div style={{ color: "#F6F4EF", fontSize: "30px", fontWeight: 600 }}>
            Musicphonetics
          </div>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#C9A227",
              fontSize: "22px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "18px",
            }}
          >
            Education-first music company
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "72px",
              fontWeight: 700,
              lineHeight: 1.08,
              maxWidth: "950px",
            }}
          >
            <div style={{ color: "#F6F4EF" }}>Building the future of</div>
            <div style={{ color: "#C9A227" }}>music education.</div>
          </div>
        </div>

        {/* Bottom: subline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(246,244,239,0.15)",
            paddingTop: "28px",
          }}
        >
          <div style={{ color: "rgba(246,244,239,0.75)", fontSize: "28px" }}>
            Founded in India. Teaching across cities. Expanding globally.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
