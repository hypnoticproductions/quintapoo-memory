import { mysqlTable, varchar, text, timestamp, int } from 'drizzle-orm/mysql-core';

/**
 * Leads table for tracking sales pipeline
 * Used by lead_pipeline.py for automated follow-up emails
 */
export const leads = mysqlTable('leads', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  source: varchar('source', { length: 100 }).notNull(), // 'Sally', 'Website', 'Referral', 'Cold Outreach'
  status: varchar('status', { length: 50 }).notNull().default('new'), // 'new', 'contacted', 'qualified', 'converted', 'lost'
  notes: text('notes'),
  lastContact: timestamp('last_contact'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});
