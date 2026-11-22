import { levelInfo } from "@/lib/domain";

const PALETTE = ["#6b6779", "#0284c7", "#5130e0", "#7c3aed", "#e8600a"];

function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string);
}

/** HU08: insignia en SVG para compartir en redes o imprimir en el stand. */
export function badgeSvg(businessName: string, level: number): string {
  const info = levelInfo(level);
  const color = PALETTE[info.level];
  const name = escapeXml(businessName.slice(0, 32));
  const dots = [0, 1, 2, 3, 4]
    .map((i) => `<circle cx="${178 + i * 22}" cy="146" r="7" fill="${i <= info.level ? color : "#dcdae3"}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="180" viewBox="0 0 420 180" font-family="Helvetica, Arial, sans-serif">
  <rect width="420" height="180" rx="22" fill="#ffffff" stroke="#ecebf0" stroke-width="2"/>
  <rect x="18" y="18" width="128" height="144" rx="18" fill="${color}"/>
  <path d="M82 52l26 10v22c0 18-11 31-26 37-15-6-26-19-26-37V62z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
  <path d="M70 86l9 9 17-19" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="82" y="146" fill="#fff" font-size="14" font-weight="700" text-anchor="middle">NIVEL ${info.level}/4</text>
  <text x="168" y="50" fill="#8d8a99" font-size="12" font-weight="700" letter-spacing="1.5">GAMARRA CONECTA</text>
  <text x="168" y="82" fill="#16141f" font-size="20" font-weight="700">${name}</text>
  <text x="168" y="112" fill="${color}" font-size="18" font-weight="700">${escapeXml(info.name)}</text>
  ${dots}
</svg>`;
}
