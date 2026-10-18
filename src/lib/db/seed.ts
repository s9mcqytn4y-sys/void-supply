import { db } from "./index";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/void_supply";

async function seed() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Peringatan Keamanan: Seeding dilarang keras dijalankan pada environment produksi!");
    process.exit(1);
  }

  // Multi-layer connection guard: Cegah eksekusi ke remote/staging tanpa izin eksplisit
  try {
    const parsedUrl = new URL(connectionString);
    const host = parsedUrl.hostname;
    const isLocalhost = host === "localhost" || host === "127.0.0.1" || host === "::1";
    if (!isLocalhost && process.env.ALLOW_NON_LOCAL_SEED !== "true") {
      console.error(
        `❌ Peringatan Keamanan: Host basis data terdeteksi '${host}'. Seeding otomatis hanya diizinkan untuk host lokal (localhost / 127.0.0.1). Set ALLOW_NON_LOCAL_SEED=true jika Anda benar-benar yakin!`
      );
      process.exit(1);
    }
  } catch {
    console.warn("⚠️ Peringatan: Gagal mem-parse DATABASE_URL sebagai URL standar. Melanjutkan dengan kewaspadaan.");
  }

  console.log("--- Memulai Seeding Database VOID Supply (Atomic Transaction Mode) ---");

  await db.transaction(async (tx) => {
    const isForceReset = process.env.SEED_FORCE_RESET === "true";

    if (isForceReset) {
      console.log("⚠️ Mode SEED_FORCE_RESET aktif: Membersihkan tabel transaksi dan data pelanggan...");
      await tx.delete(schema.produkKeKoleksi);
      await tx.delete(schema.itemPesanan);
      await tx.delete(schema.pembayaran);
      await tx.delete(schema.pengiriman);
      await tx.delete(schema.pesanan);
      await tx.delete(schema.pelanggan);
      await tx.delete(schema.varianProduk);
      await tx.delete(schema.produk);
      await tx.delete(schema.koleksi);
      await tx.delete(schema.kategori);
      console.log("✓ Seluruh data lama berhasil dibersihkan dalam transaksi atomik");
    } else {
      console.log("🛡️ Mode Safe Seeding: Memperbarui katalog referensi tanpa menghapus data transaksi/pelanggan.");
      await tx.delete(schema.produkKeKoleksi);
      await tx.delete(schema.varianProduk);
      await tx.delete(schema.produk);
      await tx.delete(schema.koleksi);
      await tx.delete(schema.kategori);
      console.log("✓ Data katalog referensi disiapkan untuk pembaruan");
    }

    // 1.1 Seeding Profil Pelanggan Demo (Persona Rian The Trendsetter)
    const [pelangganRian] = await tx
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
      .onConflictDoNothing({ target: schema.pelanggan.email })
      .returning();

    if (pelangganRian) {
      console.log(`✓ Profil pelanggan seed (${pelangganRian.namaLengkap}) berhasil didaftarkan`);
    } else {
      console.log("✓ Profil pelanggan seed sudah ada, melewati pembuatan duplikat");
    }

    // 2. Seeding Kategori
    const [katOuterwear, katTshirt, katPants, katAccessories] = await tx
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
    const [drop04] = await tx
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

  // 4. Katalog Produk Master (8 Artikel Drop 04) dengan Spesifikasi & Size Guide Nyata
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
      spesifikasi: {
        material: {
          komposisi: "100% Katun Combed 16s",
          gramasi: "235 GSM (Heavyweight High-Density)",
          pewarnaan: "Reactive Dye Jet Black (Tahan Luntur)",
          finishing: "Pre-shrunk Enzyme Wash (Anti-Susut)",
        },
        konstruksi: {
          jahitan: "Rantai Ganda (Double Chainstitch) pada Bahu",
          kerahRib: "1x1 Spandex Rib Tebal 2.5 cm (Anti-Melar)",
          teknikGrafis: "High-Density Plastisol Curing 160°C",
          label: "Woven Satin Hitam Lembut Tanpa Iritasi",
        },
        perawatan: {
          suhuCuci: "Air Dingin Maksimal 30°C",
          bahanKimia: "Tanpa Pemutih Klorin",
          pengeringan: "Jemur Terbalik di Tempat Teduh (Hindari Mesin Pengering)",
          penyetrikaan: "Suhu Sedang, Balik Bagian Sablon",
        },
      },
      panduanUkuran: [
        { ukuran: "S", panjangBadan: 70, lebarDada: 52, panjangLengan: 23 },
        { ukuran: "M", panjangBadan: 72, lebarDada: 55, panjangLengan: 24 },
        { ukuran: "L", panjangBadan: 75, lebarDada: 58, panjangLengan: 25 },
        { ukuran: "XL", panjangBadan: 77, lebarDada: 61, panjangLengan: 26 },
        { ukuran: "XXL", panjangBadan: 79, lebarDada: 64, panjangLengan: 27 },
      ],
      varians: [
        { ukuran: "S", warna: "Hitam", sku: "VOID-D04-TEE-BLK-S", stok: 25, berat: 420 },
        { ukuran: "M", warna: "Hitam", sku: "VOID-D04-TEE-BLK-M", stok: 35, berat: 450 },
        { ukuran: "L", warna: "Hitam", sku: "VOID-D04-TEE-BLK-L", stok: 30, berat: 480 },
        { ukuran: "XL", warna: "Hitam", sku: "VOID-D04-TEE-BLK-XL", stok: 15, berat: 510 },
        { ukuran: "XXL", warna: "Hitam", sku: "VOID-D04-TEE-BLK-XXL", stok: 0, berat: 540 },
        { ukuran: "S", warna: "Bone White", sku: "VOID-D04-TEE-WHT-S", stok: 15, berat: 420 },
        { ukuran: "M", warna: "Bone White", sku: "VOID-D04-TEE-WHT-M", stok: 22, berat: 450 },
        { ukuran: "L", warna: "Bone White", sku: "VOID-D04-TEE-WHT-L", stok: 18, berat: 480 },
        { ukuran: "XL", warna: "Bone White", sku: "VOID-D04-TEE-WHT-XL", stok: 10, berat: 510 },
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
        "/images/products/drop-04/void-tee-02-detail.webp",
      ],
      spesifikasi: {
        material: {
          komposisi: "100% Katun Combed 20s",
          gramasi: "210 GSM (Medium Heavyweight)",
          pewarnaan: "Manual Mineral Acid Wash Effect",
          finishing: "Vintage Soft Distressed Touch",
        },
        konstruksi: {
          jahitan: "Double-needle Edge Seam",
          kerahRib: "Rib Katun 1x1 2.2 cm",
          teknikGrafis: "Distressed Crack Plastisol Ink",
          label: "Woven Neck Label VOID Archive",
        },
        perawatan: {
          suhuCuci: "Air Dingin Pencucian Lembut (Handwash Disarankan)",
          bahanKimia: "Dilarang Pemutih",
          pengeringan: "Keringkan Alami di Tempat Terbuka",
          penyetrikaan: "Suhu Rendah dari Dalam",
        },
      },
      panduanUkuran: [
        { ukuran: "S", panjangBadan: 69, lebarDada: 53, panjangLengan: 23 },
        { ukuran: "M", panjangBadan: 71, lebarDada: 56, panjangLengan: 24 },
        { ukuran: "L", panjangBadan: 74, lebarDada: 59, panjangLengan: 25 },
        { ukuran: "XL", panjangBadan: 76, lebarDada: 62, panjangLengan: 26 },
      ],
      varians: [
        { ukuran: "S", warna: "Charcoal", sku: "VOID-D04-ACID-CHR-S", stok: 18, berat: 430 },
        { ukuran: "M", warna: "Charcoal", sku: "VOID-D04-ACID-CHR-M", stok: 24, berat: 460 },
        { ukuran: "L", warna: "Charcoal", sku: "VOID-D04-ACID-CHR-L", stok: 20, berat: 490 },
        { ukuran: "XL", warna: "Charcoal", sku: "VOID-D04-ACID-CHR-XL", stok: 12, berat: 520 },
        { ukuran: "S", warna: "Vintage Wash Moss", sku: "VOID-D04-ACID-MOS-S", stok: 12, berat: 430 },
        { ukuran: "M", warna: "Vintage Wash Moss", sku: "VOID-D04-ACID-MOS-M", stok: 16, berat: 460 },
        { ukuran: "L", warna: "Vintage Wash Moss", sku: "VOID-D04-ACID-MOS-L", stok: 14, berat: 490 },
        { ukuran: "XL", warna: "Vintage Wash Moss", sku: "VOID-D04-ACID-MOS-XL", stok: 8, berat: 520 },
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
        "/images/products/drop-04/cybernetic-ls-01-detail.webp",
      ],
      spesifikasi: {
        material: {
          komposisi: "100% Katun Combed 24s",
          gramasi: "200 GSM (Compact High-Density)",
          pewarnaan: "Deep Jet Black Reactive",
          finishing: "Carbon Peach Soft Touch",
        },
        konstruksi: {
          jahitan: "Overlock 4-Benang Anti-Lepas",
          kerahRib: "Mock-Neck 3.5 cm Berstruktur Tegak",
          teknikGrafis: "Screenprint Plastisol Curing Multi-Pass",
          label: "Heat-Press Inner Neck Stamp",
        },
        perawatan: {
          suhuCuci: "Air Dingin Putaran Ringan",
          bahanKimia: "Tanpa Klorin",
          pengeringan: "Gantung Tanpa Pemerasan Keras",
          penyetrikaan: "Suhu Sedang",
        },
      },
      panduanUkuran: [
        { ukuran: "S", panjangBadan: 71, lebarDada: 53, panjangLengan: 61 },
        { ukuran: "M", panjangBadan: 73, lebarDada: 56, panjangLengan: 63 },
        { ukuran: "L", panjangBadan: 76, lebarDada: 59, panjangLengan: 65 },
        { ukuran: "XL", panjangBadan: 78, lebarDada: 62, panjangLengan: 67 },
      ],
      varians: [
        { ukuran: "S", warna: "Hitam", sku: "VOID-D04-LS-BLK-S", stok: 15, berat: 480 },
        { ukuran: "M", warna: "Hitam", sku: "VOID-D04-LS-BLK-M", stok: 28, berat: 510 },
        { ukuran: "L", warna: "Hitam", sku: "VOID-D04-LS-BLK-L", stok: 25, berat: 540 },
        { ukuran: "XL", warna: "Hitam", sku: "VOID-D04-LS-BLK-XL", stok: 14, berat: 570 },
        { ukuran: "S", warna: "Cyber Silver", sku: "VOID-D04-LS-SLV-S", stok: 10, berat: 480 },
        { ukuran: "M", warna: "Cyber Silver", sku: "VOID-D04-LS-SLV-M", stok: 15, berat: 510 },
        { ukuran: "L", warna: "Cyber Silver", sku: "VOID-D04-LS-SLV-L", stok: 12, berat: 540 },
        { ukuran: "XL", warna: "Cyber Silver", sku: "VOID-D04-LS-SLV-XL", stok: 6, berat: 570 },
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
        "/images/products/drop-04/hoodie-zip-detail.webp",
      ],
      spesifikasi: {
        material: {
          komposisi: "100% Cotton French Terry Fleece",
          gramasi: "420 GSM (Ultra Heavyweight Loopback)",
          pewarnaan: "Sulfur Deep Black Matte",
          finishing: "Anti-Pilling Washed Finish",
        },
        konstruksi: {
          jahitan: "Flatlock 3-Jarum Tahan Beban Tarik",
          kerahRib: "Ritsleting 2-Arah YKK Logam Hitam Matte",
          teknikGrafis: "Patch Karet 3D di Bagian Tudung",
          label: "Woven Heavy Label pada Bagian Bawah",
        },
        perawatan: {
          suhuCuci: "Air Dingin Maksimal 30°C",
          bahanKimia: "Deterjen Lembut Tanpa Pemutih",
          pengeringan: "Rebahkan di Bidang Datar (Flat Dry)",
          penyetrikaan: "Suhu Sedang dengan Kain Pelindung",
        },
      },
      panduanUkuran: [
        { ukuran: "M", panjangBadan: 70, lebarDada: 62, panjangLengan: 64 },
        { ukuran: "L", panjangBadan: 73, lebarDada: 65, panjangLengan: 66 },
        { ukuran: "XL", panjangBadan: 76, lebarDada: 68, panjangLengan: 68 },
      ],
      varians: [
        { ukuran: "M", warna: "Pitch Black", sku: "VOID-D04-HD-BLK-M", stok: 20, berat: 920 },
        { ukuran: "L", warna: "Pitch Black", sku: "VOID-D04-HD-BLK-L", stok: 25, berat: 980 },
        { ukuran: "XL", warna: "Pitch Black", sku: "VOID-D04-HD-BLK-XL", stok: 12, berat: 1040 },
        { ukuran: "M", warna: "Concrete Grey", sku: "VOID-D04-HD-GRY-M", stok: 14, berat: 920 },
        { ukuran: "L", warna: "Concrete Grey", sku: "VOID-D04-HD-GRY-L", stok: 18, berat: 980 },
        { ukuran: "XL", warna: "Concrete Grey", sku: "VOID-D04-HD-GRY-XL", stok: 10, berat: 1040 },
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
      spesifikasi: {
        material: {
          komposisi: "100% Nilon Ripstop 70D + Polar Fleece Lining",
          gramasi: "180 GSM Outer / 220 GSM Inner Fleece",
          pewarnaan: "Mil-Spec Dark Olive Drab",
          finishing: "Durable Water Repellent (DWR Finish C6)",
        },
        konstruksi: {
          jahitan: "Bartack Reinforced Seams pada Titik Tekanan",
          kerahRib: "Rib Kerah Rajut Nilon Campuran Spandex",
          teknikGrafis: "Laser-Engraved Metal Puller + Webbing Molle",
          label: "Monogram Tenun Taktikal Tahan Gesekan",
        },
        perawatan: {
          suhuCuci: "Cuci Tangan Menggunakan Air Dingin",
          bahanKimia: "Hindari Pelembut Pakaian dan Pemutih",
          pengeringan: "Angin-anginkan di Tempat Teduh",
          penyetrikaan: "Dilarang Menyetrika Langsung Permukaan Nilon",
        },
      },
      panduanUkuran: [
        { ukuran: "M", panjangBadan: 68, lebarDada: 63, panjangLengan: 63 },
        { ukuran: "L", panjangBadan: 71, lebarDada: 66, panjangLengan: 65 },
        { ukuran: "XL", panjangBadan: 74, lebarDada: 69, panjangLengan: 67 },
      ],
      varians: [
        { ukuran: "M", warna: "Olive Drab", sku: "VOID-D04-BMB-OLV-M", stok: 10, berat: 850 },
        { ukuran: "L", warna: "Olive Drab", sku: "VOID-D04-BMB-OLV-L", stok: 15, berat: 900 },
        { ukuran: "XL", warna: "Olive Drab", sku: "VOID-D04-BMB-OLV-XL", stok: 8, berat: 950 },
        { ukuran: "M", warna: "Shadow Black", sku: "VOID-D04-BMB-BLK-M", stok: 8, berat: 850 },
        { ukuran: "L", warna: "Shadow Black", sku: "VOID-D04-BMB-BLK-L", stok: 12, berat: 900 },
        { ukuran: "XL", warna: "Shadow Black", sku: "VOID-D04-BMB-BLK-XL", stok: 6, berat: 950 },
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
        "/images/products/drop-04/cargo-pants-detail.webp",
      ],
      spesifikasi: {
        material: {
          komposisi: "100% Cotton Ripstop Grid Fabric",
          gramasi: "280 GSM (Tough Tactical Weave)",
          pewarnaan: "Carbon Black Vat Dye",
          finishing: "Bio-Polish Prewash (Luwes & Nyaman)",
        },
        konstruksi: {
          jahitan: "Triple-Stitch Inseam Pengunci Sobekan",
          kerahRib: "YKK Metal Zipper Fly + Tombol Logam Donat",
          teknikGrafis: "6 Kantong Kargo Geometris dengan Penutup Flap",
          label: "Silicone Puller pada Tali Serut Kaki",
        },
        perawatan: {
          suhuCuci: "Air Dingin Mesin Cuci Putaran Normal",
          bahanKimia: "Tanpa Pemutih",
          pengeringan: "Gantung Kering Terbalik",
          penyetrikaan: "Suhu Katun Sedang hingga Tinggi",
        },
      },
      panduanUkuran: [
        { ukuran: "S", panjangCelana: 102, lingkarPinggang: 78, lebarPaha: 34 },
        { ukuran: "M", panjangCelana: 104, lingkarPinggang: 82, lebarPaha: 36 },
        { ukuran: "L", panjangCelana: 106, lingkarPinggang: 86, lebarPaha: 38 },
        { ukuran: "XL", panjangCelana: 108, lingkarPinggang: 90, lebarPaha: 40 },
      ],
      varians: [
        { ukuran: "S", warna: "Black Onyx", sku: "VOID-D04-CRG-BLK-S", stok: 16, berat: 680 },
        { ukuran: "M", warna: "Black Onyx", sku: "VOID-D04-CRG-BLK-M", stok: 24, berat: 720 },
        { ukuran: "L", warna: "Black Onyx", sku: "VOID-D04-CRG-BLK-L", stok: 20, berat: 760 },
        { ukuran: "XL", warna: "Black Onyx", sku: "VOID-D04-CRG-BLK-XL", stok: 10, berat: 800 },
        { ukuran: "S", warna: "Desaturated Khaki", sku: "VOID-D04-CRG-KHK-S", stok: 10, berat: 680 },
        { ukuran: "M", warna: "Desaturated Khaki", sku: "VOID-D04-CRG-KHK-M", stok: 15, berat: 720 },
        { ukuran: "L", warna: "Desaturated Khaki", sku: "VOID-D04-CRG-KHK-L", stok: 12, berat: 760 },
        { ukuran: "XL", warna: "Desaturated Khaki", sku: "VOID-D04-CRG-KHK-XL", stok: 6, berat: 800 },
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
        "/images/products/drop-04/pleated-pants-detail.webp",
      ],
      spesifikasi: {
        material: {
          komposisi: "98% Katun Twill + 2% Spandex Elastane",
          gramasi: "310 GSM (Struktur Drape Kokoh)",
          pewarnaan: "Deep Charcoal Grey",
          finishing: "Enzyme Soft Touch Wash",
        },
        konstruksi: {
          jahitan: "Tailored French Seam",
          kerahRib: "Double Front Pleat + Kancing Kait Logam Tersembunyi",
          teknikGrafis: "Saku Paspoal Belakang Ganda",
          label: "Piping Satin di Bagian Pinggang Dalam",
        },
        perawatan: {
          suhuCuci: "Dry Clean Disarankan atau Cuci Tangan Air Dingin",
          bahanKimia: "Dilarang Pemutih Klorin",
          pengeringan: "Gantung Tegak Menjaga Lipatan",
          penyetrikaan: "Suhu Katun Sedang searah Garis Lipit",
        },
      },
      panduanUkuran: [
        { ukuran: "S", panjangCelana: 100, lingkarPinggang: 78, lebarPaha: 33 },
        { ukuran: "M", panjangCelana: 102, lingkarPinggang: 82, lebarPaha: 35 },
        { ukuran: "L", panjangCelana: 104, lingkarPinggang: 86, lebarPaha: 37 },
        { ukuran: "XL", panjangCelana: 106, lingkarPinggang: 90, lebarPaha: 39 },
      ],
      varians: [
        { ukuran: "S", warna: "Deep Grey", sku: "VOID-D04-PLT-GRY-S", stok: 14, berat: 590 },
        { ukuran: "M", warna: "Deep Grey", sku: "VOID-D04-PLT-GRY-M", stok: 20, berat: 630 },
        { ukuran: "L", warna: "Deep Grey", sku: "VOID-D04-PLT-GRY-L", stok: 18, berat: 670 },
        { ukuran: "XL", warna: "Deep Grey", sku: "VOID-D04-PLT-GRY-XL", stok: 9, berat: 710 },
        { ukuran: "S", warna: "Hitam", sku: "VOID-D04-PLT-BLK-S", stok: 12, berat: 590 },
        { ukuran: "M", warna: "Hitam", sku: "VOID-D04-PLT-BLK-M", stok: 16, berat: 630 },
        { ukuran: "L", warna: "Hitam", sku: "VOID-D04-PLT-BLK-L", stok: 15, berat: 670 },
        { ukuran: "XL", warna: "Hitam", sku: "VOID-D04-PLT-BLK-XL", stok: 8, berat: 710 },
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
      ],
      spesifikasi: {
        material: {
          komposisi: "92% Poliester Mikrofiber + 8% Spandex Breathable",
          gramasi: "160 GSM (Ringan, Elastis 4-Way Stretch)",
          pewarnaan: "Solid Jet Black Anti-Fade",
          finishing: "Anti-Bakteri & Quick-Dry Moisture Wicking",
        },
        konstruksi: {
          jahitan: "Seamless 3D Circular Knit",
          kerahRib: "Bukaan Mata Berpenjepit Elastis Ergonomis",
          teknikGrafis: "Patch Silikon 3D Monogram Timbul 2 mm",
          label: "Heat-Transfer Care Label Tanpa Gesekan Kulit",
        },
        perawatan: {
          suhuCuci: "Cuci Tangan Air Dingin",
          bahanKimia: "Tanpa Pemutih / Tanpa Pelembut",
          pengeringan: "Keringkan Cepat di Tempat Teduh",
          penyetrikaan: "Dilarang Disetrika",
        },
      },
      panduanUkuran: [
        { ukuran: "ALL", lingkarKepala: 58, panjangBadan: 38 },
      ],
      varians: [
        { ukuran: "ALL", warna: "Hitam", sku: "VOID-D04-ACC-BAL-ALL", stok: 40, berat: 180 },
        { ukuran: "ALL", warna: "Concrete Grey", sku: "VOID-D04-ACC-BAL-GRY", stok: 25, berat: 180 },
      ],
    },
    {
      kategoriId: katPants.id,
      nama: "Tactical Modular Cargo Pants V2",
      slug: "tactical-modular-cargo-v2",
      deskripsi:
        "Celana kargo teknikal generasi kedua dengan material Cordura Ripstop 320 GSM dan sistem gesper magnetik FIDLOCK. Dilengkapi 8 saku kargo asimetris dan tali ankle cinch untuk penyesuaian siluet seketika.",
      hargaDasar: 789000,
      gambarUtama: "/images/products/drop-04/cargo-v2-front.webp",
      galeriGambar: [
        "/images/products/drop-04/cargo-v2-front.webp",
      ],
      spesifikasi: {
        material: {
          komposisi: "100% Cordura Ripstop Nylon 320 GSM",
          gramasi: "320 GSM (Ultra-Durable Grid Weave)",
          pewarnaan: "Deep Jet Black Carbon Dye",
          finishing: "DWR C6 Durable Water Repellent",
        },
        konstruksi: {
          jahitan: "Triple Chainstitch Inseam & Bartack di 12 Titik Beban",
          kerahRib: "FIDLOCK Magnetic Buckle System + YKK Vislon Zipper",
          teknikGrafis: "8 Kantong Kargo Modular dengan Gusset 3D",
          label: "Woven Monogram Mil-Spec Tactical",
        },
        perawatan: {
          suhuCuci: "Air Dingin Maksimal 30°C Putaran Lembut",
          bahanKimia: "Tanpa Pemutih / Tanpa Pelembut",
          pengeringan: "Gantung Teduh Tanpa Mesin Pengering",
          penyetrikaan: "Suhu Rendah dari Sisi Dalam",
        },
      },
      panduanUkuran: [
        { ukuran: "S", panjangCelana: 103, lingkarPinggang: 78, lebarPaha: 34 },
        { ukuran: "M", panjangCelana: 105, lingkarPinggang: 82, lebarPaha: 36 },
        { ukuran: "L", panjangCelana: 107, lingkarPinggang: 86, lebarPaha: 38 },
        { ukuran: "XL", panjangCelana: 109, lingkarPinggang: 90, lebarPaha: 40 },
      ],
      varians: [
        { ukuran: "S", warna: "Pitch Black", sku: "VOID-D04-CRGV2-BLK-S", stok: 18, berat: 640 },
        { ukuran: "M", warna: "Pitch Black", sku: "VOID-D04-CRGV2-BLK-M", stok: 25, berat: 670 },
        { ukuran: "L", warna: "Pitch Black", sku: "VOID-D04-CRGV2-BLK-L", stok: 20, berat: 710 },
        { ukuran: "XL", warna: "Pitch Black", sku: "VOID-D04-CRGV2-BLK-XL", stok: 12, berat: 750 },
        { ukuran: "S", warna: "Ashen Grey", sku: "VOID-D04-CRGV2-ASH-S", stok: 10, berat: 640 },
        { ukuran: "M", warna: "Ashen Grey", sku: "VOID-D04-CRGV2-ASH-M", stok: 16, berat: 670 },
        { ukuran: "L", warna: "Ashen Grey", sku: "VOID-D04-CRGV2-ASH-L", stok: 14, berat: 710 },
        { ukuran: "XL", warna: "Ashen Grey", sku: "VOID-D04-CRGV2-ASH-XL", stok: 8, berat: 750 },
      ],
    },
    {
      kategoriId: katOuterwear.id,
      nama: "Cybernetic Pullover Heavy Hoodie",
      slug: "cybernetic-pullover-hoodie",
      deskripsi:
        "Hoodie pullover berpotongan boxy oversized berbahan katun loopback french terry berkepadatan tinggi 450 GSM. Menampilkan grafis tipografi sirkuit futuristik tonal pada lengan dengan finishing acid mineral wash.",
      hargaDasar: 749000,
      gambarUtama: "/images/products/drop-04/cyber-hoodie-front.webp",
      galeriGambar: [
        "/images/products/drop-04/cyber-hoodie-front.webp",
      ],
      spesifikasi: {
        material: {
          komposisi: "100% Cotton Heavy French Terry",
          gramasi: "450 GSM (Extreme Heavyweight Fabric)",
          pewarnaan: "Mineral Acid Wash Vintage Effect",
          finishing: "Silicone Bio-Wash Anti-Linting",
        },
        konstruksi: {
          jahitan: "Flatlock Stitching 4-Needle Seam",
          kerahRib: "Tudung Ganda Berlapis Tanpa Tali Serut Terurai",
          teknikGrafis: "Screenprint Tonal Circuit Typography",
          label: "Monogram VOID Industrial Label",
        },
        perawatan: {
          suhuCuci: "Air Dingin 30°C",
          bahanKimia: "Deterjen Lembut Tanpa Klorin",
          pengeringan: "Rebahkan di Bidang Datar",
          penyetrikaan: "Suhu Sedang",
        },
      },
      panduanUkuran: [
        { ukuran: "S", panjangBadan: 69, lebarDada: 61, panjangLengan: 62 },
        { ukuran: "M", panjangBadan: 72, lebarDada: 64, panjangLengan: 64 },
        { ukuran: "L", panjangBadan: 75, lebarDada: 67, panjangLengan: 66 },
        { ukuran: "XL", panjangBadan: 78, lebarDada: 70, panjangLengan: 68 },
      ],
      varians: [
        { ukuran: "S", warna: "Acid Black", sku: "VOID-D04-PLV-BLK-S", stok: 15, berat: 820 },
        { ukuran: "M", warna: "Acid Black", sku: "VOID-D04-PLV-BLK-M", stok: 22, berat: 860 },
        { ukuran: "L", warna: "Acid Black", sku: "VOID-D04-PLV-BLK-L", stok: 18, berat: 910 },
        { ukuran: "XL", warna: "Acid Black", sku: "VOID-D04-PLV-BLK-XL", stok: 10, berat: 960 },
        { ukuran: "S", warna: "Raw Cement", sku: "VOID-D04-PLV-CMT-S", stok: 10, berat: 820 },
        { ukuran: "M", warna: "Raw Cement", sku: "VOID-D04-PLV-CMT-M", stok: 14, berat: 860 },
        { ukuran: "L", warna: "Raw Cement", sku: "VOID-D04-PLV-CMT-L", stok: 12, berat: 910 },
        { ukuran: "XL", warna: "Raw Cement", sku: "VOID-D04-PLV-CMT-XL", stok: 6, berat: 960 },
      ],
    },
    {
      kategoriId: katAccessories.id,
      nama: "Modular Crossbody Sling Bag V1",
      slug: "modular-crossbody-sling-bag",
      deskripsi:
        "Tas selempang utilitarian berdaya tahan tinggi bermaterial kain laminasi waterproof X-Pac VX21. Dilengkapi ritsleting kedap air YKK Aquaguard dan tali webbing nilon taktikal dengan buckle quick-release.",
      hargaDasar: 499000,
      gambarUtama: "/images/products/drop-04/sling-bag-front.webp",
      galeriGambar: [
        "/images/products/drop-04/sling-bag-front.webp",
      ],
      spesifikasi: {
        material: {
          komposisi: "X-Pac VX21 Laminate (DWR + Poliester + Film Tahan Sobek)",
          gramasi: "210 GSM Dimension-Polyant",
          pewarnaan: "Solid Matte Black Stealth",
          finishing: "100% Tahan Air Cuaca Ekstrem",
        },
        konstruksi: {
          jahitan: "Jahitan Bartack Berlapis Tape Waterproof",
          kerahRib: "Buckle Quick-Release Paduan Logam Ringan",
          teknikGrafis: "Saku Ritsleting YKK Aquaguard Anti-Air",
          label: "Embossed Geometric Symbol Patch",
        },
        perawatan: {
          suhuCuci: "Cukup Usap dengan Lap Basah Bersih",
          bahanKimia: "Dilarang Deterjen Keras / Mesin Cuci",
          pengeringan: "Keringkan Udara di Tempat Sejuk",
          penyetrikaan: "Dilarang Keras Disetrika",
        },
      },
      panduanUkuran: [
        { ukuran: "ALL", panjangBadan: 28, lebarDada: 18, panjangLengan: 8 },
      ],
      varians: [
        { ukuran: "ALL", warna: "Pitch Black", sku: "VOID-D04-SLG-BLK-ALL", stok: 35, berat: 340 },
        { ukuran: "ALL", warna: "Stealth Slate", sku: "VOID-D04-SLG-SLT-ALL", stok: 20, berat: 340 },
      ],
    },
    {
      kategoriId: katAccessories.id,
      nama: "Distressed Industrial Utility Cap",
      slug: "distressed-utility-cap",
      deskripsi:
        "Topi baseball 6-panel berbahan katun twill tebal dengan treatment washed vintage distressed. Dilengkapi gesper pengatur logam ukiran laser dan bordir monogram geometris tonal di bagian dahi.",
      hargaDasar: 289000,
      gambarUtama: "/images/products/drop-04/utility-cap-front.webp",
      galeriGambar: [
        "/images/products/drop-04/utility-cap-front.webp",
      ],
      spesifikasi: {
        material: {
          komposisi: "100% Cotton Heavyweight Chino Twill",
          gramasi: "290 GSM",
          pewarnaan: "Mineral Washed Vintage Charcoal",
          finishing: "Edge Destructed Distressed Detail",
        },
        konstruksi: {
          jahitan: "Konstruksi 6-Panel Berstruktur Tegak",
          kerahRib: "Tali Belakang Katun dengan Gesper Logam Laser-Engraved",
          teknikGrafis: "Bordir Komputer High-Density Monogram Tonal",
          label: "Woven Inner Sweatband Label",
        },
        perawatan: {
          suhuCuci: "Sikat Lembut Manual dengan Air Sabun Ringan",
          bahanKimia: "Tanpa Pemutih",
          pengeringan: "Keringkan dengan Mempertahankan Bentuk Crown",
          penyetrikaan: "Dilarang Menyetrika Bagian Visor",
        },
      },
      panduanUkuran: [
        { ukuran: "ALL", lingkarKepala: 58, panjangBadan: 12 },
      ],
      varians: [
        { ukuran: "ALL", warna: "Washed Black", sku: "VOID-D04-CAP-BLK-ALL", stok: 40, berat: 135 },
        { ukuran: "ALL", warna: "Vintage Olive", sku: "VOID-D04-CAP-OLV-ALL", stok: 25, berat: 135 },
      ],
    },
  ];

  for (const item of dataProduk) {
    const [produkBaru] = await tx
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
        spesifikasi: item.spesifikasi,
        panduanUkuran: item.panduanUkuran,
      })
      .returning();

    // Hubungkan produk ke Koleksi Drop 04
    await tx.insert(schema.produkKeKoleksi).values({
      produkId: produkBaru.id,
      koleksiId: drop04.id,
    });

    // Masukkan Varian Produk
    for (const v of item.varians) {
      await tx.insert(schema.varianProduk).values({
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

  console.log(`✓ Berhasil memasukkan ${dataProduk.length} artikel Drop 04 beserta varian fisik, spesifikasi teknis, dan size guide`);
  });

  console.log("--- Seeding Selesai dengan Sukses ---");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Galat saat seeding database:", err);
  process.exit(1);
});
