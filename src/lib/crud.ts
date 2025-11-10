import { db } from "@/db";
import { eq } from "drizzle-orm";
import { AnyPgTable } from "drizzle-orm/pg-core";

export class CrudService<TTable extends AnyPgTable, TModel> {
  constructor(
    private table: TTable,
    private primaryKey: keyof TModel
  ) {}

  async getAll() {
    return db.select().from(this.table as AnyPgTable);
  }

  async getOne(id: number) {
    // @ts-ignore
    return db.select().from(this.table).where(eq(this.table[this.primaryKey], id)).limit(1);
  }

  async create(data: Partial<TModel>) {
    // @ts-ignore
    const [result] = await db.insert(this.table).values(data).returning();
    return result;
  }

  async update(id: number, data: Partial<TModel>) {
    // @ts-ignore
    const [result] = await db
      .update(this.table)
      .set(data)
      .where(eq(this.table[this.primaryKey], id))
      .returning();
    return result;
  }

  async delete(id: number) {
    // @ts-ignore
    await db.delete(this.table).where(eq(this.table[this.primaryKey], id));
    return { success: true };
  }
}
