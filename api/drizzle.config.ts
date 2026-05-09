import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: [
    './src/db/master.schema.ts',
    './src/db/tenant.schema.ts'
  ],
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http', // For D1
});
