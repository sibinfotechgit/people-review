import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { entityStatuses, entityTypes } from "@/domain/entities";
import { users } from "./auth";

export const entityTypeEnum = pgEnum("entity_type", entityTypes);
export const entityStatusEnum = pgEnum("entity_status", entityStatuses);

export const entities = pgTable(
  "entities",
  {
    id: uuid("entity_id").defaultRandom().primaryKey(),
    type: entityTypeEnum("entity_type").notNull(),
    canonicalName: varchar("canonical_name", { length: 300 }).notNull(),
    slug: varchar("slug", { length: 350 }),
    status: entityStatusEnum("status").default("draft").notNull(),
    description: text("description"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("entities_slug_unique").on(table.slug),
    index("entities_type_status_idx").on(table.type, table.status),
    index("entities_name_idx").on(table.canonicalName),
  ],
);

export const relationshipTypeEnum = pgEnum("relationship_type", [
  "branch_of",
  "owned_by",
  "operates",
  "manufactured_by",
  "variant_of",
  "sold_by",
  "offered_at",
  "part_of",
  "located_at",
]);

export const entityRelationships = pgTable(
  "entity_relationships",
  {
    id: uuid("relationship_id").defaultRandom().primaryKey(),
    fromEntityId: uuid("from_entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "restrict" }),
    toEntityId: uuid("to_entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "restrict" }),
    type: relationshipTypeEnum("relationship_type").notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validTo: timestamp("valid_to", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("entity_relationship_unique").on(
      table.fromEntityId,
      table.toEntityId,
      table.type,
    ),
    index("entity_relationship_from_idx").on(table.fromEntityId),
    index("entity_relationship_to_idx").on(table.toEntityId),
  ],
);


export const reviewStatusEnum = pgEnum("review_status", [
  "published",
  "pending",
  "hidden",
]);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("review_id").defaultRandom().primaryKey(),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    reviewerName: varchar("reviewer_name", { length: 80 }).notNull(),
    rating: integer("rating").notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    body: text("body").notNull(),
    firstHandExperience: integer("first_hand_experience").default(1).notNull(),
    publicDisplayMode: varchar("public_display_mode", { length: 20 }).default("profile_name").notNull(),
    experienceDate: timestamp("experience_date", { withTimezone: true }),
    status: reviewStatusEnum("status").default("published").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("reviews_entity_created_idx").on(table.entityId, table.createdAt),
    index("reviews_status_idx").on(table.status),
    sql`constraint reviews_rating_check check (${table.rating} between 1 and 5)`,
    sql`constraint reviews_display_mode_check check (${table.publicDisplayMode} in ('profile_name', 'anonymous'))`,
  ],
);
