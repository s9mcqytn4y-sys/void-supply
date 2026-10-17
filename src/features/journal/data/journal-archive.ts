/**
 * @file journal-archive.ts
 * @description Master data kuratorial arsip editorial jurnal VOID Supply.
 * Memuat dokumentasi Drop 01 hingga Drop 04 secara komprehensif tanpa karakter em dash.
 */

export interface TextileSpec {
  tipe: string;
  gramasi: string;
  pewarnaan: string;
  konstruksi: string;
}

export interface ColorwaySwatch {
  nama: string;
  hex: string;
  keterangan: string;
}

export interface ArchivalProduct {
  sku: string;
  nama: string;
  kategori: string;
  hargaRilis: number;
  status: "TERSEDIA" | "TERJUAL HABIS" | "VAULT";
  deskripsiSingkat: string;
}

export interface JournalDropEntry {
  slug: string;
  nomorDrop: string;
  judul: string;
  subjudul: string;
  periode: string;
  status: "AKTIF" | "ARSIP";
  bannerLookbook: string;
  galeriFoto: string[];
  ringkasan: string;
  narasiFilosofis: string[];
  spesifikasiTekstil: TextileSpec[];
  paletWarna: ColorwaySwatch[];
  artikelRilisan: ArchivalProduct[];
}

export const JOURNAL_ARCHIVE: JournalDropEntry[] = [
  {
    slug: "night-transmission",
    nomorDrop: "DROP 04",
    judul: "NIGHT TRANSMISSION",
    subjudul: "Urban Nocturnal Protective System",
    periode: "Oktober 2026",
    status: "AKTIF",
    bannerLookbook: "/images/lookbook/drop-04-editorial-hero.webp",
    galeriFoto: [
      "/images/lookbook/drop-04-editorial-hero.webp",
      "/images/products/drop-04/hoodie-zip-front.webp",
      "/images/products/drop-04/bomber-front.webp",
      "/images/products/drop-04/cargo-pants-front.webp",
    ],
    ringkasan:
      "Eksplorasi siluet pelindung perkotaan dengan fokus pada balaclava hooded fleece, overcoat modular, dan celana cargo lipit ganda berbahan katun ripstop berkepadatan tinggi.",
    narasiFilosofis: [
      "Perkotaan pada dini hari menuntut pakaian yang tidak sekadar menutupi tubuh, melainkan berfungsi sebagai perisai isolasi terhadap angin malam dan kelembaban aspal tropis.",
      "Drop 04 Night Transmission membedah kembali artikulasi gerak dinamis komuter metropolitan. Setiap pola potong dirancang dengan volume ekstra pada bagian lengan dan punggung (drop-shoulder exaggerated), memungkinkan sirkulasi udara mikro tanpa mengorbankan siluet boxy yang tegas.",
      "Melalui penggunaan pewarnaan reaktif pekat dan finishing enzyme wash, tekstur permukaan kain katun 16s dan 500 GSM French Terry menampilkan karakter doff matte yang meredam refleksi cahaya lampu kota.",
    ],
    spesifikasiTekstil: [
      {
        tipe: "French Terry Loopback",
        gramasi: "500 GSM (Heavyweight)",
        pewarnaan: "Reactive Jet Black & Pigment Dye",
        konstruksi: "Overlocked Chainstitch dengan Rib Elastan 2.5 cm",
      },
      {
        tipe: "Katun Combed 16s",
        gramasi: "235 GSM (High-Density)",
        pewarnaan: "Acid Wash & Enzyme Softener",
        konstruksi: "Double-needle Edge Seam tanpa jahitan samping torso",
      },
      {
        tipe: "Cotton Ripstop Modular",
        gramasi: "210 GSM (Tear-Resistant)",
        pewarnaan: "Mineral Wash Charcoal & Olive",
        konstruksi: "Bartack Gusset Crotch & Double Pleated Knees",
      },
    ],
    paletWarna: [
      { nama: "Jet Black", hex: "#0A0A0A", keterangan: "Pigmen hitam pekat reaktif absorbsi cahaya maksimal" },
      { nama: "Washed Black", hex: "#1A1A1A", keterangan: "Efek cucian mineral dengan degradasi tepi jahitan" },
      { nama: "Phantom Charcoal", hex: "#2E3033", keterangan: "Abu-abu arang gelap terinspirasi aspal basah" },
      { nama: "Raw Olive", hex: "#4A4B3A", keterangan: "Hijau lumut redup standar utilitarian militer" },
      { nama: "Bone White", hex: "#E5E2DA", keterangan: "Putih tulang alami tanpa pemutih kimiawi optik" },
    ],
    artikelRilisan: [
      {
        sku: "VOID-D04-TEE-01",
        nama: "Void Heavyweight Oversized Tee 01",
        kategori: "T-Shirt",
        hargaRilis: 389000,
        status: "TERSEDIA",
        deskripsiSingkat: "Combed 16s 235 GSM boxy cut dengan grafis plastisol tebal.",
      },
      {
        sku: "VOID-D04-TEE-02",
        nama: "Void Acid Wash Vintage Tee 02",
        kategori: "T-Shirt",
        hargaRilis: 429000,
        status: "TERSEDIA",
        deskripsiSingkat: "Combed 20s tekstur acid wash vintage dengan tipografi distressed.",
      },
      {
        sku: "VOID-D04-HOOD-ZIP",
        nama: "Night Transmission Heavy Zip Hoodie",
        kategori: "Outerwear",
        hargaRilis: 789000,
        status: "TERSEDIA",
        deskripsiSingkat: "500 GSM French Terry dengan resleting dua arah kustom YKK matte black.",
      },
      {
        sku: "VOID-D04-JKT-BOMBER",
        nama: "Modular Tactical Bomber Jacket",
        kategori: "Outerwear",
        hargaRilis: 899000,
        status: "TERSEDIA",
        deskripsiSingkat: "Lapisan ganda nilon-katun dengan kompartemen saku modular tersembunyi.",
      },
    ],
  },
  {
    slug: "concrete-monolith",
    nomorDrop: "DROP 03",
    judul: "CONCRETE MONOLITH",
    subjudul: "Architectural Heavyweight Form Study",
    periode: "Juni 2026",
    status: "ARSIP",
    bannerLookbook: "/images/lookbook/journal-editorial-archive.jpg",
    galeriFoto: [
      "/images/lookbook/journal-editorial-archive.jpg",
      "/images/products/drop-04/pleated-pants-front.webp",
      "/images/products/drop-04/cybernetic-ls-01-front.webp",
    ],
    ringkasan:
      "Penelitian mendalam mengenai struktur siluet boxy 500 GSM French Terry tanpa jahitan samping untuk menciptakan struktur jatuh pakaian yang kokoh mandiri.",
    narasiFilosofis: [
      "Terinspirasi dari langgam arsitektur Brutalisme yang merayakan kejujuran material mentah, Concrete Monolith memandang kain sebagai substansi struktural bukan sekadar lembaran tipis.",
      "Fokus riset tertuju pada rajutan melingkar (tubular body knitting) yang menghilangkan jahitan samping. Pola ini menghasilkan struktur silinder tegak yang mempertahankan bentuk kotak (boxy structure) secara konsisten meskipun telah melalui puluhan siklus pencucian.",
      "Pengembangan warna mengadopsi spektrum semen cor kering, agregat abu-abu granit, dan bayangan bayonet monolitik di bawah terik matahari siang perkotaan.",
    ],
    spesifikasiTekstil: [
      {
        tipe: "Tubular Heavy French Terry",
        gramasi: "500 GSM (Stiff Drape)",
        pewarnaan: "Pigment Garment Dye Cement",
        konstruksi: "Seamless Tubular Body Knitting",
      },
      {
        tipe: "Raw Structured Heavy Jersey",
        gramasi: "260 GSM (Coarse Texture)",
        pewarnaan: "Graphite Sulphur Wash",
        konstruksi: "Reinforced Drop-Shoulder Bias Seams",
      },
    ],
    paletWarna: [
      { nama: "Monolith Grey", hex: "#424347", keterangan: "Abu-abu beton cor mentah industrial" },
      { nama: "Cement Ash", hex: "#7A7D84", keterangan: "Gradasi semen kering berdebu alami" },
      { nama: "Raw Graphite", hex: "#222428", keterangan: "Warna grafit mineral gelap pekat" },
      { nama: "Limestone Off-White", hex: "#D9D6CE", keterangan: "Batu kapur kusam dengan serat katun alami terlihat" },
    ],
    artikelRilisan: [
      {
        sku: "VOID-D03-HOOD-MONO",
        nama: "Monolith Seamless Tubular Hoodie",
        kategori: "Outerwear",
        hargaRilis: 749000,
        status: "TERJUAL HABIS",
        deskripsiSingkat: "Hoodie 500 GSM rajutan tubular tanpa sambungan pinggang.",
      },
      {
        sku: "VOID-D03-TEE-BOX",
        nama: "Raw Heavyweight Boxy Tee",
        kategori: "T-Shirt",
        hargaRilis: 369000,
        status: "TERJUAL HABIS",
        deskripsiSingkat: "260 GSM Jersey tebal berpotongan lebar dengan garis bahu jatuh.",
      },
      {
        sku: "VOID-D03-PNT-SCULPT",
        nama: "Sculptural Wide Trousers",
        kategori: "Pants",
        hargaRilis: 629000,
        status: "VAULT",
        deskripsiSingkat: "Celana lebar berkantung arsitektural dengan lipit depan ganda.",
      },
    ],
  },
  {
    slug: "nocturnal-dynamics",
    nomorDrop: "DROP 02",
    judul: "NOCTURNAL DYNAMICS",
    subjudul: "Thermal Adaptation & Midnight Transit",
    periode: "Januari 2026",
    status: "ARSIP",
    bannerLookbook: "/images/lookbook/journal-editorial-archive.jpg",
    galeriFoto: [
      "/images/lookbook/journal-editorial-archive.jpg",
      "/images/products/drop-04/void-tee-02-front.webp",
      "/images/products/drop-04/balaclava-front.webp",
    ],
    ringkasan:
      "Perkenalan pertama sistem ribbing leher elastan 330 GSM dan finishing benang doff pada kaos lengan panjang katun combed untuk ketahanan bentuk maksimal.",
    narasiFilosofis: [
      "Bagaimana merespons perubahan temperatur mendadak saat berpindah dari ruang interior berpendingin udara ekstrem ke udara malam tropis yang lembap? Pertanyaan ini memicu kelahiran Nocturnal Dynamics.",
      "Studio menguji komposisi ventilasi mekanis melalui pori rajutan mikro dan lubang keling tembaga berlapisan doff hitam pada area ketiak dan lipatan punggung.",
      "Setiap jahitan kerah diperkuat rajutan elastan 330 GSM untuk menjamin kerah leher tidak mengalami gelombang atau deformasi elastis setelah pemakaian intensif.",
    ],
    spesifikasiTekstil: [
      {
        tipe: "Compact Long-Staple Cotton",
        gramasi: "210 GSM (Silky Matte)",
        pewarnaan: "Midnight Obsidian Vat Dye",
        konstruksi: "330 GSM Spandex Reinforced Collar Rib",
      },
      {
        tipe: "Ventilated Cotton Drill",
        gramasi: "280 GSM (Rigid Weave)",
        pewarnaan: "Asphalt Navy Deep Soak",
        konstruksi: "Concealed Eyelet Ventilation Array",
      },
    ],
    paletWarna: [
      { nama: "Midnight Obsidian", hex: "#0F1115", keterangan: "Hitam kebiruan malam pekat di bawah lampu merkuri" },
      { nama: "Asphalt Navy", hex: "#181D26", keterangan: "Biru gelap warna jalan tol layang tengah malam" },
      { nama: "Shadow Moss", hex: "#2B332C", keterangan: "Hijau lumut bayangan dinding beton perimeter" },
      { nama: "Pale Ash", hex: "#B0B4BC", keterangan: "Abu-abu tipis aksen reflektif" },
    ],
    artikelRilisan: [
      {
        sku: "VOID-D02-LS-DYNAMIC",
        nama: "Nocturnal Dynamic Longsleeve",
        kategori: "T-Shirt",
        hargaRilis: 419000,
        status: "TERJUAL HABIS",
        deskripsiSingkat: "Longsleeve katun kompak dengan lubang jempol dan ribbing kerah 330 GSM.",
      },
      {
        sku: "VOID-D02-PNT-TRACK",
        nama: "Segmented Transit Cargo",
        kategori: "Pants",
        hargaRilis: 659000,
        status: "VAULT",
        deskripsiSingkat: "Celana cargo dengan panel lutut ergonomis berpotongan lengkung.",
      },
    ],
  },
  {
    slug: "initial-protocol",
    nomorDrop: "DROP 01",
    judul: "INITIAL PROTOCOL",
    subjudul: "Foundational Atmospheric Testing",
    periode: "Agustus 2025",
    status: "ARSIP",
    bannerLookbook: "/images/lookbook/journal-editorial-archive.jpg",
    galeriFoto: [
      "/images/lookbook/journal-editorial-archive.jpg",
      "/images/products/drop-04/void-tee-01-front.webp",
    ],
    ringkasan:
      "Rilisan foundational pertama studio: pengujian awal daya tahan kain katun terhadap kelembaban udara malam hari di Jakarta Pusat.",
    narasiFilosofis: [
      "Initial Protocol adalah manifesto kelahiran VOID Supply. Dibuat dalam jumlah terbatas sebanyak 100 potong untuk menguji hipotesis dasar kami mengenai ketahanan garmen lokal bermutu tinggi.",
      "Kami menolak kompromi kain tipis yang lumrah di pasaran beriklim tropis. Kami membuktikan bahwa katun combed benang tebal 16s berpori terbuka justru memberi isolasi ruang bernapas yang lebih nyaman daripada serat sintetis.",
      "Hasil uji keausan dari Drop 01 inilah yang kemudian menjadi cetak biru standar spesifikasi seluruh pakaian yang kami produksi hingga hari ini.",
    ],
    spesifikasiTekstil: [
      {
        tipe: "Open-End Heavy Cotton 16s",
        gramasi: "220 GSM (Dry Handfeel)",
        pewarnaan: "Reactive Sulphur Black",
        konstruksi: "Single-Needle Lockstitch dengan Bartack Sudut",
      },
    ],
    paletWarna: [
      { nama: "Core Void Black", hex: "#000000", keterangan: "Hitam absolut dasar studio" },
      { nama: "Slate Dust", hex: "#5C6068", keterangan: "Warna debu konstruksi beton pra-cetak" },
      { nama: "Natural Cotton", hex: "#EDE8DF", keterangan: "Katun alami unbleached dengan serpihan biji kapas" },
    ],
    artikelRilisan: [
      {
        sku: "VOID-D01-TEE-PROTO",
        nama: "Prototype 01 Foundation Tee",
        kategori: "T-Shirt",
        hargaRilis: 329000,
        status: "TERJUAL HABIS",
        deskripsiSingkat: "Kaos perdana berpotongan longgar dengan label tenun nomor seri manual.",
      },
      {
        sku: "VOID-D01-CAP-UTILITY",
        nama: "Foundation Archival Cap",
        kategori: "Accessories",
        hargaRilis: 249000,
        status: "VAULT",
        deskripsiSingkat: "Topi 6 panel katun kanvas tebal dengan gesper kuningan doff.",
      },
    ],
  },
];

export function getDropBySlug(slug: string): JournalDropEntry | undefined {
  return JOURNAL_ARCHIVE.find((entry) => entry.slug === slug);
}

export function getAllDropSlugs(): string[] {
  return JOURNAL_ARCHIVE.map((entry) => entry.slug);
}
