import { cn } from "@/lib/utils";

// Stylised (not cartographic) world map — simplified continent silhouettes on
// a 1000×480 canvas. Used as a faint hero backdrop and as the global-network
// map in the region section.

const CONTINENTS = [
  // North America
  "M150 72 C210 56 276 72 291 112 C301 137 286 152 296 167 C271 177 256 167 251 152 C236 177 216 202 236 232 C211 242 186 222 181 197 C151 197 131 172 141 142 C121 122 126 92 150 72 Z",
  // South America
  "M252 252 C287 242 317 257 322 292 C327 327 307 362 292 397 C282 422 267 422 262 397 C252 362 242 322 247 292 C242 272 242 257 252 252 Z",
  // Europe
  "M470 96 C500 86 536 93 546 111 C553 126 541 139 521 141 C526 153 511 161 499 153 C486 159 470 151 472 136 C458 129 458 106 470 96 Z",
  // Africa
  "M476 176 C521 166 576 176 591 206 C601 231 586 256 576 281 C566 311 546 346 521 361 C501 373 486 361 483 336 C471 316 466 286 471 256 C461 231 459 196 476 176 Z",
  // Asia (with a southward India peninsula around x700)
  "M560 90 C650 65 782 70 852 100 C892 118 882 150 852 160 C872 175 857 195 827 190 C802 205 772 195 762 175 C742 190 717 185 707 165 C695 205 690 240 706 256 C690 268 670 252 666 232 C650 205 645 174 655 150 C602 150 566 130 560 90 Z",
  // Australia
  "M812 330 C852 318 902 328 912 356 C918 379 897 396 870 393 C847 401 820 393 814 371 C802 359 800 341 812 330 Z",
];

export function WorldMapShape({
  className,
  fill = "rgba(246,244,239,0.06)",
  stroke = "rgba(246,244,239,0.16)",
}: {
  className?: string;
  fill?: string;
  stroke?: string;
}) {
  return (
    <svg
      viewBox="0 0 1000 480"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {CONTINENTS.map((d, i) => (
        <path key={i} d={d} fill={fill} stroke={stroke} strokeWidth={1} />
      ))}
    </svg>
  );
}
