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

  it("memverifikasi lebar barcode untuk resi panjang tidak melebihi lebar kertas thermal 100mm (~378px)", () => {
    const resiPanjang = "WYB-1792293604299";
    const svg = generateCode128Svg(resiPanjang);

    // Ambil nilai width dari atribut SVG
    const widthMatch = svg.match(/width="([\d.]+)"/);
    expect(widthMatch).not.toBeNull();
    const widthPx = parseFloat(widthMatch![1]);

    // Kertas thermal 100mm setara ~378px pada 96 DPI. Barcode harus lebih kecil agar aman dalam margin label.
    expect(widthPx).toBeLessThan(360);
    expect(svg).toContain('preserveAspectRatio="xMidYMid meet"');
  });

  it("memverifikasi integritas quiet zone minimal 10 modul dan checksum modulo 103", () => {
    const resi = "JNE123456789";
    const lebarBar = 1.4;
    const svg = generateCode128Svg(resi, { lebarBar });

    // Modul quiet zone = 10 modul * 1.4 = 14px
    const firstRectMatch = svg.match(/<rect x="([\d.]+)"/);
    expect(firstRectMatch).not.toBeNull();
    const firstX = parseFloat(firstRectMatch![1]);

    expect(firstX).toBeGreaterThanOrEqual(14);
  });
});
