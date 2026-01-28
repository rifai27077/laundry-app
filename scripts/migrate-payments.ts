import { sql } from "../lib/db";

async function main() {
  try {
    console.log("Starting migration...");

    // Create ENUM type for payment method
    // Note: We use raw SQL. We need to handle if type already exists or just try catch it.
    // But since this is a one-off for the user, I'll just write the DDL.
    
    // We can't easily check checking IF EXISTS for types in postgres without a query, 
    // but typically 'CREATE TYPE ...' fails if it exists. 
    // We can wrap in DO block or just try/catch blocks.

    try {
        await sql`CREATE TYPE metode_pembayaran AS ENUM ('cash', 'transfer', 'qris')`;
        console.log("Created type metode_pembayaran");
    } catch (e: any) {
        if (e.code === '42710') { // duplicate_object
            console.log("Type metode_pembayaran already exists, skipping.");
        } else {
            throw e;
        }
    }

    await sql`
      CREATE TABLE IF NOT EXISTS pembayaran (
          id SERIAL PRIMARY KEY,
          id_transaksi INT REFERENCES transaksi(id) ON DELETE CASCADE,
          tgl_bayar TIMESTAMP DEFAULT NOW(),
          jumlah_bayar INT NOT NULL,
          metode_pembayaran metode_pembayaran,
          keterangan TEXT
      )
    `;
    console.log("Created table pembayaran");

    await sql`CREATE INDEX IF NOT EXISTS idx_pembayaran_transaksi ON pembayaran(id_transaksi)`;
    console.log("Created index idx_pembayaran_transaksi");

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
