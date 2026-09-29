import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Helper to load env vars from .env.local if not already in process.env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const seedPhone = process.env.SEED_PHONE || "+919876543210";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment or .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("🌱 Starting Vaani seed script...");

  // 1. Identify target user
  const targetEmail = process.argv[2]?.trim();
  let user;

  const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();
  if (userError || !usersData?.users || usersData.users.length === 0) {
    console.error("❌ Error retrieving users:", userError?.message || "No users found in Supabase Auth.");
    console.log("👉 Please sign up or log in first at http://localhost:3000/signup");
    process.exit(1);
  }

  if (targetEmail) {
    user = usersData.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (!user) {
      console.error(`❌ User with email "${targetEmail}" was not found.`);
      process.exit(1);
    }
  } else {
    // Pick the most recent user
    user = usersData.users[0];
  }

  console.log(`👤 Seeding data for user: ${user.email || user.id} (${user.id})`);

  // Ensure profile exists and display name is friendly
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "Aarav",
      onboarded: true,
    },
    { onConflict: "id" }
  );

  // 2. Person: "Maa"
  const { data: existingPeople, error: personFetchError } = await supabase
    .from("people")
    .select("*")
    .eq("user_id", user.id)
    .eq("name", "Maa");

  if (personFetchError) {
    console.error("❌ Error querying people table:", personFetchError.message);
    process.exit(1);
  }

  let maaId;
  if (existingPeople && existingPeople.length > 0) {
    maaId = existingPeople[0].id;
    console.log(`✓ Person "Maa" already exists (id: ${maaId})`);
  } else {
    const { data: insertedMaa, error: maaInsertError } = await supabase
      .from("people")
      .insert({
        user_id: user.id,
        name: "Maa",
        nickname: "Maa",
        relationship: "Mom",
        phone_e164: seedPhone,
        language: "en",
        voice: "claire",
        tone: "warm",
        memory_enabled: true,
        tint: "#F2A65A",
        consent_confirmed: true,
      })
      .select()
      .single();

    if (maaInsertError) {
      console.error("❌ Error inserting person Maa:", maaInsertError.message);
      process.exit(1);
    }
    maaId = insertedMaa.id;
    console.log(`✓ Created person "Maa" (id: ${maaId}) with phone ${seedPhone}`);
  }

  // 3. Completed Calls (2 calls)
  const { data: existingCalls } = await supabase
    .from("calls")
    .select("id, status, started_at")
    .eq("person_id", maaId)
    .eq("status", "completed");

  if (!existingCalls || existingCalls.length === 0) {
    console.log("📞 Seeding 2 completed calls...");

    // Call 1: 5 days ago
    const call1Start = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const call1End = new Date(call1Start.getTime() + 420 * 1000);

    await supabase.from("calls").insert({
      user_id: user.id,
      person_id: maaId,
      status: "completed",
      notes: "Check in on sleep and weekend plans.",
      personal_message: "Hope you had a relaxing afternoon.",
      started_at: call1Start.toISOString(),
      ended_at: call1End.toISOString(),
      duration_seconds: 420,
      mood_note: "She sounded a bit tired, but brightened up when asking about your week.",
      summary: {
        what_happened: "A warm seven-minute chat. Maa mentioned feeling tired and having some trouble sleeping.",
        important_updates: ["Trouble sleeping lately", "Looking forward to your next visit"],
        worth_remembering: ["Started evening walks again", "Needs a firmer pillow"],
        next_call: ["Ask if the new pillow arrived", "Ask how she's sleeping"],
      },
      needs_attention: false,
    });

    // Call 2: 2 days ago (matches Section 2 transcript & summary)
    const call2Start = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const call2End = new Date(call2Start.getTime() + 512 * 1000);

    await supabase.from("calls").insert({
      user_id: user.id,
      person_id: maaId,
      status: "completed",
      notes: "Ask about her knee and Meena's wedding. Tell her I'll visit in March.",
      personal_message: "Tell her I'm proud of her, and I'll call this weekend.",
      started_at: call2Start.toISOString(),
      ended_at: call2End.toISOString(),
      duration_seconds: 512,
      mood_note: "She sounded cheerful, and she laughed twice. She'd love a real call this weekend.",
      summary: {
        what_happened: "A warm ten-minute chat. Maa sounded cheerful and in good spirits.",
        important_updates: ["Sleep has improved with the new pillow", "Her knee is bothering her again"],
        worth_remembering: [
          "Meena's wedding is on the 14th",
          "Loves her evening walks",
          "Worries you don't eat properly",
        ],
        next_call: ["Ask how the knee is", "Ask how the wedding went"],
      },
      needs_attention: false,
    });

    console.log("✓ Inserted 2 completed calls with rich summaries.");
  } else {
    console.log(`✓ Completed calls already exist (${existingCalls.length} found). Skipping.`);
  }

  // 4. Weekly Sunday 6:30 pm schedule
  const { data: scheduledCalls } = await supabase
    .from("calls")
    .select("id")
    .eq("person_id", maaId)
    .eq("status", "scheduled")
    .eq("recurrence", "weekly_sunday_1830");

  if (!scheduledCalls || scheduledCalls.length === 0) {
    // Next Sunday 18:30 IST (13:00 UTC)
    const nextSunday = new Date();
    const dayOfWeek = nextSunday.getDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
    nextSunday.setUTCHours(13, 0, 0, 0); // 13:00 UTC is 18:30 IST

    await supabase.from("calls").insert({
      user_id: user.id,
      person_id: maaId,
      status: "scheduled",
      notes: "Weekly catch-up with Maa. Ask about her knee and Meena's wedding.",
      personal_message: "Tell her I'm proud of her, and I'll call this weekend.",
      scheduled_for: nextSunday.toISOString(),
      recurrence: "weekly_sunday_1830",
    });
    console.log(`✓ Scheduled weekly Sunday 6:30 pm call created for ${nextSunday.toISOString()}`);
  } else {
    console.log("✓ Weekly Sunday 6:30 pm schedule already present.");
  }

  // 5. 6 Memories
  const memoriesToSeed = [
    { content: "Trouble sleeping. Improving since the new pillow.", kind: "health", pinned: false },
    { content: "Meena's wedding is on the 14th.", kind: "plan", pinned: true },
    { content: "Loves her evening walks.", kind: "preference", pinned: false },
    { content: "Worries you don't eat properly.", kind: "moment", pinned: false },
    { content: "Planting marigolds on the balcony this month.", kind: "moment", pinned: false },
    { content: "Prefers calls in the evening after tea.", kind: "preference", pinned: false },
  ];

  const { data: existingMemories } = await supabase
    .from("memories")
    .select("content")
    .eq("person_id", maaId);

  const existingContents = new Set(existingMemories?.map((m) => m.content) || []);

  let addedMemoriesCount = 0;
  for (const item of memoriesToSeed) {
    if (!existingContents.has(item.content)) {
      await supabase.from("memories").insert({
        user_id: user.id,
        person_id: maaId,
        content: item.content,
        kind: item.kind,
        pinned: item.pinned,
      });
      addedMemoriesCount++;
    }
  }

  console.log(`✓ Seeded ${addedMemoriesCount} new memories (total: ${memoriesToSeed.length})`);
  console.log("\n🎉 Seed complete! Dashboard and People views are fully populated.");
}

main().catch((err) => {
  console.error("❌ Fatal error in seed script:", err);
  process.exit(1);
});
