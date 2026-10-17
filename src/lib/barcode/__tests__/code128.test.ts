import { describe, it, expect } from "vitest";
import { generateCode128Svg } from "../code128";

describe("Code 128 Barcode Generator Unit Tests", () => {
  it("menghasilkan elemen SVG valid untuk string resi standar", () => {
    const resi = "RESI-JNE-1792248383";
    const svg = generateCode128Svg(resi);

    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("<rect");
    expect(svg).toContain(resi);
  });

  it("menangani string kosong secara aman tanpa crash", () => {
    const svg = generateCode128Svg("");
    expect(svg).toContain("<svg");
    expect(svg).not.toContain("<rect");
  });

  it("menghasilkan barcode tanpa teks ketika tampilkanTeks=false", () => {
    const resi = "003456789012";
    const svg = generateCode128Svg(resi, { tampilkanTeks: false });

    expect(svg).toContain("<svg");
    expect(svg).toContain("<rect");
    expect(svg).not.toContain("<text");
  });

  it("menghasilkan modul bar proporsional sesuai opsi lebarBar dan tinggi", () => {
    const resi = "VOID-TEST-2026";
    const svg = generateCode128Svg(resi, { lebarBar: 3, tinggi: 80 });

    expect(svg).toContain('height="80"');
  });
});
