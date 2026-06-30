import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt =
  "Musicphonetics — Building the future of music education";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function dataUri(rel: string, mime: string) {
  const buf = await readFile(join(process.cwd(), "public", rel));
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export default async function OpengraphImage() {
  const [logo, photo] = await Promise.all([
    dataUri("logo-wordmark-light.png", "image/png"),
    dataUri("gallery/09-mentor.jpg", "image/jpeg"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#161B26",
          fontFamily: "serif",
        }}
      >
        {/* Left — brand + headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px",
            width: "740px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} height={56} alt="Musicphonetics" />

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
              Music education, built like an institution
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: "62px",
                fontWeight: 700,
                lineHeight: 1.08,
              }}
            >
              <div style={{ color: "#F6F4EF" }}>Building the future of</div>
              <div style={{ color: "#C9A227" }}>music education.</div>
            </div>
          </div>

          <div style={{ color: "rgba(246,244,239,0.7)", fontSize: "24px" }}>
            Founded in India · 1,100+ students taught
          </div>
        </div>

        {/* Right — real photography */}
        <div style={{ display: "flex", position: "relative", flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt=""
            width={460}
            height={630}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, #161B26 0%, rgba(22,27,38,0) 35%)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
