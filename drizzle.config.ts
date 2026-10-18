const config = {
  schema: ["./src/lib/db/schema.ts", "./src/lib/db/auth.schema.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL_MIGRATION ||
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/void_supply",
  },
};

export default config;
