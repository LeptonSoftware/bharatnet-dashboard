import { env } from "@rio.js/env";
import { createClient } from "@supabase/supabase-js";

interface NationalRowData {
  state: string;
  abbreviation: string;
  // ... other fields
}

// Supabase admin client - requires service role key for auto-confirmation
const supabaseAdmin = createClient(
  env.PRIVATE_SUPABASE_URL,
  env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const NATIONAL_API_URL =
  "https://api.sheety.co/632604ca09353483222880568eb0ebe2/bharatnetMonitoringDashboard/dashboard";

async function fetchNationalData(): Promise<NationalRowData[]> {
  try {
    const response = await fetch(NATIONAL_API_URL);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.dashboard || [];
  } catch (error) {
    console.error("Error fetching national data:", error);
    throw error;
  }
}

async function createUserForCircle(abbreviation: string, state: string) {
  const email = `bharatnet.${abbreviation.toLowerCase()}@bsnl.in`;
  const password = `bharatnet@${abbreviation.toLowerCase()}123`;

  try {
    console.log(`Creating user for ${state} (${abbreviation}): ${email}`);

    // Create user with auto-confirmation using admin SDK
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        circle: abbreviation,
        state: state,
        role: "circle_user",
      },
    });

    if (error) {
      console.error(`Error creating user for ${abbreviation}:`, error.message);
      return false;
    }

    console.log(
      `✅ Successfully created user for ${state} (${abbreviation}): ${email}`
    );

    // Insert circle role data
    if (user.user) {
      const { error: roleError } = await supabaseAdmin
        .from("circle_roles")
        .insert({
          user_id: user.user.id,
          circles: [{ circle: abbreviation.toLowerCase() }],
          role: "viewer",
        });

      if (roleError) {
        console.error(
          `Error creating circle role for ${abbreviation}:`,
          roleError.message
        );
        return false;
      }

      console.log(
        `✅ Successfully created circle role for ${state} (${abbreviation})`
      );

      // Insert into circle_users table for permissions
      // const { error: circleUserError } = await supabaseAdmin
      //   .from("circle_users")
      //   .insert({
      //     user_id: user.user.id,
      //     circle: abbreviation.toLowerCase(),
      //     permissions: ["read", "write"], // default permissions
      //   });

      // if (circleUserError) {
      //   console.error(
      //     `Error creating circle user permission for ${abbreviation}:`,
      //     circleUserError.message
      //   );
      //   return false;
      // }

      console.log(
        `✅ Successfully created circle user permission for ${state} (${abbreviation})`
      );
    }

    return true;
  } catch (error) {
    console.error(`Unexpected error creating user for ${abbreviation}:`, error);
    return false;
  }
}

async function setupCircleUsers() {
  console.log("🚀 Starting circle user setup...");

  // Check if service role key is provided
  if (!env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "❌ PRIVATE_SUPABASE_SERVICE_ROLE_KEY environment variable is required"
    );
    console.error(
      "Please set it to your Supabase service role key from your Supabase dashboard"
    );
    process.exit(1);
  }

  try {
    // Fetch national data to get list of states/circles
    console.log("📊 Fetching national data...");
    const nationalData = await fetchNationalData();

    if (!nationalData || nationalData.length === 0) {
      console.error("❌ No national data found");
      process.exit(1);
    }

    console.log(`📋 Found ${nationalData.length} states/circles`);

    // Create users for each state/circle
    let successCount = 0;
    let failureCount = 0;

    for (const row of nationalData) {
      const success = await createUserForCircle(row.abbreviation, row.state);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("\n🎉 Setup complete!");
    console.log(`✅ Successfully created: ${successCount} users`);
    console.log(`❌ Failed to create: ${failureCount} users`);

    if (failureCount > 0) {
      console.log("\n📋 User credentials format:");
      console.log("Email: bharatnet.<circle>@bsnl.in");
      console.log("Password: bharatnet@<circle>123");
      console.log("(where <circle> is the lowercase abbreviation)");
    }
  } catch (error) {
    console.error("❌ Fatal error during setup:", error);
    process.exit(1);
  }
}

// Run the setup
setupCircleUsers()
  .then(() => {
    console.log("🏁 Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
