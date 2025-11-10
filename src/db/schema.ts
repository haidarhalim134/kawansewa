import {
    pgTable,
    serial,
    integer,
    varchar,
    text,
    numeric,
    date,
    timestamp,
    primaryKey,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name"),
    location: varchar("location", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const items = pgTable("items", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    ownerId: integer("owner_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    detail: text("detail"),
    pricePerDay: numeric("price_per_day", { precision: 10, scale: 2 }).notNull(),
});

export const vouchers = pgTable("vouchers", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull(),
});

export const rentals = pgTable("rentals", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    itemId: integer("item_id")
        .notNull()
        .references(() => items.id, { onDelete: "cascade" }),
    renterId: integer("renter_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    voucherId: integer("voucher_id").references(() => vouchers.id, { onDelete: "set null" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
});

export const reviews = pgTable("reviews", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    rentalId: integer("rental_id")
        .notNull()
        .references(() => rentals.id, { onDelete: "cascade" }),
    star: integer("star").notNull(), // Validate 1–5 at app level
});

export const itemImages = pgTable("item_images", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    itemId: integer("item_id")
        .notNull()
        .references(() => items.id, { onDelete: "cascade" }),
    imageOrder: integer("image_order").notNull(),
    imageUrl: varchar("image_url", { length: 1024 }).notNull(),
    }, (table) => [
        uniqueIndex("item_image_order_unique").on(
            table.itemId,
            table.imageOrder
        )
    ]
);



export const userFollows = pgTable(
    "user_follows",
    {
        followerId: integer("follower_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        followingId: integer("following_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
    },
    (table) => [
        primaryKey({ columns: [table.followerId, table.followingId] }),
    ]
);

export const itemFavorites = pgTable(
    "item_favorites",
    {
        userId: integer("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        itemId: integer("item_id")
            .notNull()
            .references(() => items.id, { onDelete: "cascade" }),
    },
    (table) => [
        primaryKey({ columns: [table.userId, table.itemId] }),
    ]
);

export const notifications = pgTable("notifications", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    targetUrl: varchar("target_url", { length: 1024 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
