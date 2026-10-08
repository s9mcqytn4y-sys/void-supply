import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/void_supply";

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log("--- Memulai Seeding Database VOID Supply ---");

  // 1. Bersihkan Data Lama
  await db.delete(schema.produkKeKoleksi);
  await db.delete(schema.itemPesanan);
  await db.delete(schema.pembayaran);
  await db.delete(schema.pengiriman);
  await db.delete(schema.pesanan);
  await db.delete(schema.pelanggan);
  await db.delete(schema.varianProduk);
  await db.delete(schema.produk);
  await db.delete(schema.koleksi);
  await db.delete(schema.kategori);

  console.log("✓ Data lama berhasil dibersihkan");

  // 1.1 Seeding Profil Pelanggan (Persona Rian The Trendsetter)
  const [pelangganRian] = await db
    .insert(schema.pelanggan)
    .values({
      namaLengkap: "Rian Pratama",
      email: "rian.trendsetter@voidsupply.test",
      telepon: "081298765432",
      alamatDefault: "Jl. Kemang Timur No. 42, Bangka, Mampang Prapatan",
      kotaDefault: "Jakarta Selatan",
      provinsiDefault: "DKI Jakarta",
      kodePosDefault: "12730",
    })
    .returning();

  console.log(`✓ Profil pelanggan seed (${pelangganRian.namaLengkap}) berhasil dibuat`);

  // 2. Seeding Kategori
  const [katOuterwear, katTshirt, katPants, katAccessories] = await db
    .insert(schema.kategori)
    .values([
      {
        nama: "Outerwear",
        slug: "outerwear",
        deskripsi: "Heavyweight jackets, zip hoodies, and technical bombers.",
        urutan: 1,
      },
      {
        nama: "T-Shirt",
        slug: "tshirt",
        deskripsi: "24s and 16s oversized boxy cut tees and graphic longsleeves.",
        urutan: 2,
      },
      {
        nama: "Pants",
        slug: "pants",
        deskripsi: "Tactical cargo trousers and relaxed wide-leg silhouettes.",
        urutan: 3,
      },
      {
        nama: "Accessories",
        slug: "accessories",
        deskripsi: "Utility balaclavas, caps, and technical gear.",
        urutan: 4,
      },
    ])
    .returning();

  console.log("✓ Kategori busana berhasil di-seed");

  // 3. Seeding Koleksi / Drop 04
  const [drop04] = await db
    .insert(schema.koleksi)
    .values({
      nama: "Drop 04: Night Transmission",
      slug: "drop-04-night-transmission",
      deskripsi: "Limited edition high-density streetwear engineered for urban nocturnal climate.",
      nomorDrop: "04",
      bannerGambar: "/images/lookbook/drop-04-editorial-hero.webp",
      apakahAktif: true,
      rilisPada: new Date("2026-10-08T20:00:00Z"),
    })
    .returning();

  console.log("✓ Koleksi Drop 04 berhasil di-seed");

  // 4. Katalog Produk Master (8 Artikel Drop 04)
  const dataProduk = [
    {
      kategoriId: katTshirt.id,
      nama: "Void Heavyweight Oversized Tee 01",
      slug: "void-heavyweight-tee-01",
      deskripsi:
        "Kaos potongan boxy oversized dengan material katun combed 16s berkepadatan tinggi (235 GSM). Finishing enzyme wash dengan sablon plastisol high-density pada bagian dada dan punggung.",
      hargaDasar: 389000,
      gambarUtama: "/images/products/drop-04/void-tee-01-front.webp",
      galeriGambar: [
        "/images/products/drop-04/void-tee-01-front.webp",
        "/images/products/drop-04/void-tee-01-back.webp",
        "/images/products/drop-04/void-tee-01-detail.webp",
      ],
      varians: [
        { ukuran: "S", warna: "Hitam", sku: "VOID-D04-TEE-BLK-S", stok: 25, berat: 420 },
        { ukuran: "M", warna: "Hitam", sku: "VOID-D04-TEE-BLK-M", stok: 35, berat: 450 },
        { ukuran: "L", warna: "Hitam", sku: "VOID-D04-TEE-BLK-L", stok: 30, berat: 480 },
        { ukuran: "XL", warna: "Hitam", sku: "VOID-D04-TEE-BLK-XL", stok: 15, berat: 510 },
        { ukuran: "XXL", warna: "Hitam", sku: "VOID-D04-TEE-BLK-XXL", stok: 8, berat: 540 },
      ],
    },
    {
      kategoriId: katTshirt.id,
      nama: "Void Acid Wash Vintage Tee 02",
      slug: "void-acid-wash-tee-02",
      deskripsi:
        "Kaos garmen katun 20s dengan teknik acid wash manual. Tekstur vintage charcoal unik pada setiap helai pakaian berpadu grafis distressed typography khas VOID.",
      hargaDasar: 429000,
      gambarUtama: "/images/products/drop-04/void-tee-02-front.webp",
      galeriGambar: [
        "/images/products/drop-04/void-tee-02-front.webp",
        "/images/products/drop-04/void-tee-02-back.webp",
        "/images/products/drop-04/void-tee-02-detail.webp",
      ],
      varians: [
        { ukuran: "S", warna: "Charcoal", sku: "VOID-D04-ACID-CHR-S", stok: 18, berat: 430 },
        { ukuran: "M", warna: "Charcoal", sku: "VOID-D04-ACID-CHR-M", stok: 24, berat: 460 },
        { ukuran: "L", warna: "Charcoal", sku: "VOID-D04-ACID-CHR-L", stok: 20, berat: 490 },
        { ukuran: "XL", warna: "Charcoal", sku: "VOID-D04-ACID-CHR-XL", stok: 12, berat: 520 },
      ],
    },
    {
      kategoriId: katTshirt.id,
      nama: "Cybernetic Graphic Longsleeve 01",
      slug: "cybernetic-graphic-longsleeve-01",
      deskripsi:
        "Kaos lengan panjang berkerah mock-neck dengan grafis sirkuit tipografi pada kedua sisi lengan. Rib manset elastis 1x1 anti-melar.",
      hargaDasar: 459000,
      gambarUtama: "/images/products/drop-04/cybernetic-ls-01-front.webp",
      galeriGambar: [
        "/images/products/drop-04/cybernetic-ls-01-front.webp",
        "/images/products/drop-04/cybernetic-ls-01-back.webp",
        "/images/products/drop-04/cybernetic-ls-01-detail.webp",
      ],
      varians: [
        { ukuran: "S", warna: "Hitam", sku: "VOID-D04-LS-BLK-S", stok: 15, berat: 480 },
        { ukuran: "M", warna: "Hitam", sku: "VOID-D04-LS-BLK-M", stok: 28, berat: 510 },
        { ukuran: "L", warna: "Hitam", sku: "VOID-D04-LS-BLK-L", stok: 25, berat: 540 },
        { ukuran: "XL", warna: "Hitam", sku: "VOID-D04-LS-BLK-XL", stok: 14, berat: 570 },
      ],
    },
    {
      kategoriId: katOuterwear.id,
      nama: "Transmission Heavy Zip Hoodie",
      slug: "transmission-heavy-zip-hoodie",
      deskripsi:
        "Hoodie ritsleting berbahan fleece katun berat 420 GSM tanpa bulu dalam. Dilengkapi ritsleting 2-arah YKK logam hitam matte dan tudung ganda terstruktur.",
      hargaDasar: 789000,
      gambarUtama: "/images/products/drop-04/hoodie-zip-front.webp",
      galeriGambar: [
        "/images/products/drop-04/hoodie-zip-front.webp",
        "/images/products/drop-04/hoodie-zip-back.webp",
        "/images/products/drop-04/hoodie-zip-detail.webp",
      ],
      varians: [
        { ukuran: "M", warna: "Pitch Black", sku: "VOID-D04-HD-BLK-M", stok: 20, berat: 920 },
        { ukuran: "L", warna: "Pitch Black", sku: "VOID-D04-HD-BLK-L", stok: 25, berat: 980 },
        { ukuran: "XL", warna: "Pitch Black", sku: "VOID-D04-HD-BLK-XL", stok: 12, berat: 1040 },
      ],
    },
    {
      kategoriId: katOuterwear.id,
      nama: "Void Modular Technical Bomber",
      slug: "void-modular-bomber",
      deskripsi:
        "Jaket bomber teknikal dengan bahan nilon ripstop tahan percikan air (DWR finish). Dilengkapi kantong kargo modular di lengan dan lapisan isolasi polar ringan.",
      hargaDasar: 1150000,
      gambarUtama: "/images/products/drop-04/bomber-front.webp",
      galeriGambar: [
        "/images/products/drop-04/bomber-front.webp",
        "/images/products/drop-04/bomber-back.webp",
        "/images/products/drop-04/bomber-detail.webp",
      ],
      varians: [
        { ukuran: "M", warna: "Olive Drab", sku: "VOID-D04-BMB-OLV-M", stok: 10, berat: 850 },
        { ukuran: "L", warna: "Olive Drab", sku: "VOID-D04-BMB-OLV-L", stok: 15, berat: 900 },
        { ukuran: "XL", warna: "Olive Drab", sku: "VOID-D04-BMB-OLV-XL", stok: 8, berat: 950 },
      ],
    },
    {
      kategoriId: katPants.id,
      nama: "Tactical Cargo Wide Pants",
      slug: "tactical-cargo-wide-pants",
      deskripsi:
        "Celana kargo berpotongan lebar dengan 6 saku geometris tersembunyi. Tali serut teknis di bagian bawah pipa celana untuk transisi cepat ke gaya tapered.",
      hargaDasar: 689000,
      gambarUtama: "/images/products/drop-04/cargo-pants-front.webp",
      galeriGambar: [
        "/images/products/drop-04/cargo-pants-front.webp",
        "/images/products/drop-04/cargo-pants-back.webp",
        "/images/products/drop-04/cargo-pants-detail.webp",
      ],
      varians: [
        { ukuran: "S", warna: "Black Onyx", sku: "VOID-D04-CRG-BLK-S", stok: 16, berat: 680 },
        { ukuran: "M", warna: "Black Onyx", sku: "VOID-D04-CRG-BLK-M", stok: 24, berat: 720 },
        { ukuran: "L", warna: "Black Onyx", sku: "VOID-D04-CRG-BLK-L", stok: 20, berat: 760 },
        { ukuran: "XL", warna: "Black Onyx", sku: "VOID-D04-CRG-BLK-XL", stok: 10, berat: 800 },
      ],
    },
    {
      kategoriId: katPants.id,
      nama: "Relaxed Pleated Trousers",
      slug: "relaxed-pleated-trousers",
      deskripsi:
        "Celana formal kontemporer berlipit ganda dengan bahan katun twill bertekstur. Siluet drape santai berpotongan lurus kontemporer.",
      hargaDasar: 629000,
      gambarUtama: "/images/products/drop-04/pleated-pants-front.webp",
      galeriGambar: [
        "/images/products/drop-04/pleated-pants-front.webp",
        "/images/products/drop-04/pleated-pants-back.webp",
        "/images/products/drop-04/pleated-pants-detail.webp",
      ],
      varians: [
        { ukuran: "S", warna: "Deep Grey", sku: "VOID-D04-PLT-GRY-S", stok: 14, berat: 590 },
        { ukuran: "M", warna: "Deep Grey", sku: "VOID-D04-PLT-GRY-M", stok: 20, berat: 630 },
        { ukuran: "L", warna: "Deep Grey", sku: "VOID-D04-PLT-GRY-L", stok: 18, berat: 670 },
        { ukuran: "XL", warna: "Deep Grey", sku: "VOID-D04-PLT-GRY-XL", stok: 9, berat: 710 },
      ],
    },
    {
      kategoriId: katAccessories.id,
      nama: "Void Industrial Utility Balaclava",
      slug: "void-utility-balaclava",
      deskripsi:
        "Balaclava rajut teknikal dengan serat kain breathable dan lubang visual terstruktur. Patch logo silikon tebal tahan aus di dahi kiri.",
      hargaDasar: 249000,
      gambarUtama: "/images/products/drop-04/balaclava-front.webp",
      galeriGambar: [
        "/images/products/drop-04/balaclava-front.webp",
        "/images/products/drop-04/balaclava-detail.webp",
      ],
      varians: [
        { ukuran: "ALL", warna: "Hitam", sku: "VOID-D04-ACC-BAL-ALL", stok: 40, berat: 180 },
      ],
    },
  ];

  for (const item of dataProduk) {
    const [produkBaru] = await db
      .insert(schema.produk)
      .values({
        kategoriId: item.kategoriId,
        nama: item.nama,
        slug: item.slug,
        deskripsi: item.deskripsi,
        hargaDasar: item.hargaDasar,
        status: "aktif",
        gambarUtama: item.gambarUtama,
        galeriGambar: item.galeriGambar,
      })
      .returning();

    // Hubungkan produk ke Koleksi Drop 04
    await db.insert(schema.produkKeKoleksi).values({
      produkId: produkBaru.id,
      koleksiId: drop04.id,
    });

    // Masukkan Varian Produk
    for (const v of item.varians) {
      await db.insert(schema.varianProduk).values({
        produkId: produkBaru.id,
        ukuran: v.ukuran,
        warna: v.warna,
        sku: v.sku,
        stok: v.stok,
        beratGram: v.berat,
        harga: item.hargaDasar,
      });
    }
  }

  console.log(`✓ Berhasil memasukkan ${dataProduk.length} artikel Drop 04 beserta varian fisik`);
  console.log("--- Seeding Selesai dengan Sukses ---");
  await client.end();
}

seed().catch(async (err) => {
  console.error("Galat saat seeding database:", err);
  await client.end();
  process.exit(1);
});
