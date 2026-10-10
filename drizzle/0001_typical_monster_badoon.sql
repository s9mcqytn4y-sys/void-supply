ALTER TABLE "item_pesanan" ADD CONSTRAINT "check_item_jumlah" CHECK ("item_pesanan"."jumlah" > 0);--> statement-breakpoint
ALTER TABLE "item_pesanan" ADD CONSTRAINT "check_item_harga_satuan" CHECK ("item_pesanan"."harga_satuan" >= 0);--> statement-breakpoint
ALTER TABLE "pesanan" ADD CONSTRAINT "check_pesanan_subtotal" CHECK ("pesanan"."subtotal" >= 0);--> statement-breakpoint
ALTER TABLE "pesanan" ADD CONSTRAINT "check_pesanan_total_akhir" CHECK ("pesanan"."total_akhir" >= 0);--> statement-breakpoint
ALTER TABLE "produk" ADD CONSTRAINT "check_produk_harga_dasar" CHECK ("produk"."harga_dasar" >= 0);--> statement-breakpoint
ALTER TABLE "varian_produk" ADD CONSTRAINT "check_varian_stok" CHECK ("varian_produk"."stok" >= 0);--> statement-breakpoint
ALTER TABLE "varian_produk" ADD CONSTRAINT "check_varian_harga" CHECK ("varian_produk"."harga" >= 0);--> statement-breakpoint
ALTER TABLE "varian_produk" ADD CONSTRAINT "check_varian_berat" CHECK ("varian_produk"."berat_gram" > 0);