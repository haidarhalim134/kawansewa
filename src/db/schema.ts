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
    pgEnum,
    boolean,
} from "drizzle-orm/pg-core";

export const userStatus = pgEnum("user_status", [
    "unverified",
    "pending_verification",
    "verified",
]);

export const users = pgTable("users", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name"),
    location: varchar("location", { length: 255 }),
    profileImageUrl: varchar("profile_image_url", { length: 1024 }),
    identificationImageUrl: varchar("identification_image_url", { length: 1024 }),
    status: userStatus("status").notNull().default("unverified"),
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const itemStatusEnum = pgEnum("item_status", [
    "available",
    "unavailable",
    "pending_rent", // unused? soalnya belum tentu habis bayar langsung ambil
]);

export const items = pgTable("items", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    ownerId: integer("owner_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    detail: text("detail"),
    pricePerDay: numeric("price_per_day", { precision: 10, scale: 2 }).notNull(),
    depositAmount: numeric("deposit_amount", { precision: 10, scale: 2 }).notNull().default("0"),

    status: itemStatusEnum("status").notNull().default("available"),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const vouchers = pgTable("vouchers", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    code: varchar("code", { length: 50 }).notNull().unique(),

    discountAmount: numeric("discount_amount", {
        precision: 10,
        scale: 2,
    }).notNull(),

    maxUsage: integer("max_usage").notNull().default(0), // batas total pemakaian, 0 == unlimited

    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),

    isActive: integer("is_active").notNull().default(1), // 1 = aktif, 0 = nonaktif
});

export const voucherUsed = pgTable(
    "voucher_used",
    {
        voucherId: integer("voucher_id")
            .notNull()
            .references(() => vouchers.id, { onDelete: "cascade" }),

        userId: integer("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),

        usedAt: timestamp("used_at").defaultNow().notNull(),
    },
    (table) => [
        primaryKey({
            columns: [table.voucherId, table.userId],
        }),
    ]
);

export const rentalStatusEnum = pgEnum("rental_status", [
    "pending", // waiting approval
    "approved", // waiting payment
    "rejected", // unused == canceled
    "active", // on rent
    "completed",
    "canceled",
    "paid" // siap ambil
]);

export const rentals = pgTable("rentals", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    itemId: integer("item_id")
        .notNull()
        .references(() => items.id, { onDelete: "cascade" }),
    renterId: integer("renter_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    voucherId: integer("voucher_id")
        .references(() => vouchers.id, { onDelete: "set null" }),

    totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
    depositHeld: numeric("deposit_held", { precision: 10, scale: 2 }).notNull().default("0"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),

    status: rentalStatusEnum("status").notNull().default("pending"),
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
