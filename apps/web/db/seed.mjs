import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");
const sql = postgres(databaseUrl, { max: 1, prepare: false, ssl: "require" });

const sampleEntities = [
  ["business_location", "Blue Tokai Coffee Roasters — Bandra", "blue-tokai-bandra", "A neighbourhood coffee shop known for Indian specialty coffee and relaxed work-friendly seating.", { category: "Café", location: "Bandra West, Mumbai", verified: true }],
  ["business", "Urban Company", "urban-company", "At-home services for beauty, repairs, cleaning, wellness, and more.", { category: "Home services", location: "Mumbai", verified: true }],
  ["product", "Nothing Phone (2a)", "nothing-phone-2a", "A mid-range Android smartphone focused on distinctive design and a clean software experience.", { category: "Smartphone", verified: false }],
  ["business_location", "Subko — Colaba", "subko-colaba", "Specialty coffee, craft baked goods, and a restored heritage setting in South Mumbai.", { category: "Café & bakery", location: "Colaba, Mumbai", verified: true }],
  ["service", "Zepto Grocery Delivery", "zepto-grocery-delivery", "App-based grocery and everyday essentials delivery across major Indian cities.", { category: "Delivery service", location: "Mumbai", verified: false }],
  ["brand", "boAt", "boat", "Indian consumer electronics brand offering audio products, wearables, and accessories.", { category: "Electronics", verified: true }],
];

for (const [type, name, slug, description, metadata] of sampleEntities) {
  await sql`insert into entities (entity_type, canonical_name, slug, status, description, metadata, published_at)
    values (${type}, ${name}, ${slug}, 'published', ${description}, ${sql.json(metadata)}, now())
    on conflict (slug) do update set canonical_name = excluded.canonical_name, description = excluded.description,
      metadata = excluded.metadata, status = 'published', updated_at = now()`;
}

const [blueTokai] = await sql`select entity_id from entities where slug = 'blue-tokai-bandra'`;
const [urbanCompany] = await sql`select entity_id from entities where slug = 'urban-company'`;
const seedReviews = [
  [blueTokai.entity_id, "Neha S.", 5, "Consistently excellent coffee", "The pour-over was balanced and the barista happily explained the beans. It gets busy, but the team keeps things moving.", "profile_name"],
  [blueTokai.entity_id, "Arjun Mehta", 4, "Great coffee, limited seating", "Coffee and service were both excellent. Finding a table after 6 PM was difficult, so I would visit earlier next time.", "profile_name"],
  [urbanCompany.entity_id, "Anonymous", 4, "Smooth booking experience", "Booking was simple and the professional arrived within the selected time slot. The final price matched the estimate in the app.", "anonymous"],
];
for (const [entityId, reviewerName, rating, title, body, displayMode] of seedReviews) {
  await sql`insert into reviews (entity_id, reviewer_name, rating, title, body, public_display_mode)
    select ${entityId}, ${reviewerName}, ${rating}, ${title}, ${body}, ${displayMode}
    where not exists (select 1 from reviews where entity_id = ${entityId} and title = ${title})`;
}
await sql.end();
console.log("Sample entities and reviews are ready.");