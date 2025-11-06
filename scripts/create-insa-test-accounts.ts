import { db } from "../server/db";
import { users, agents } from "../shared/schema";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const testAccounts = [
  {
    role: "guest",
    email: "guest@alga.et",
    password: "Guest@2025",
    firstName: "INSA",
    lastName: "Guest",
    phoneNumber: "+251911000001",
    phoneVerified: true,
  },
  {
    role: "host",
    email: "host@alga.et",
    password: "Host@2025",
    firstName: "INSA",
    lastName: "Host",
    phoneNumber: "+251911000002",
    phoneVerified: true,
    idVerified: true,
  },
  {
    role: "agent",
    email: "agent@alga.et",
    password: "Dellala#2025",
    firstName: "INSA",
    lastName: "Delala",
    phoneNumber: "+251911000003",
    phoneVerified: true,
    idVerified: true,
  },
  {
    role: "operator",
    email: "operator@alga.et",
    password: "Operator#2025",
    firstName: "INSA",
    lastName: "Operator",
    phoneNumber: "+251911000004",
    phoneVerified: true,
    idVerified: true,
  },
  {
    role: "admin",
    email: "admin@alga.et",
    password: "AlgaAdmin#2025",
    firstName: "INSA",
    lastName: "Administrator",
    phoneNumber: "+251911000005",
    phoneVerified: true,
    idVerified: true,
  },
];

async function createTestAccounts() {
  console.log("🔧 Creating INSA Test Accounts...\n");

  for (const account of testAccounts) {
    try {
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash(account.password, 10);

      await db.insert(users).values({
        id: userId,
        email: account.email,
        password: hashedPassword,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.role,
        phoneNumber: account.phoneNumber,
        phoneVerified: account.phoneVerified,
        idVerified: account.idVerified || false,
        status: "active",
        preferences: {},
      });

      console.log(`✅ Created ${account.role.toUpperCase()} account: ${account.email}`);

      // If this is an agent, also create agent profile
      if (account.role === "agent") {
        await db.insert(agents).values({
          userId: userId,
          fullName: `${account.firstName} ${account.lastName}`,
          phoneNumber: account.phoneNumber,
          telebirrAccount: "+251911000003",
          city: "Addis Ababa",
          status: "approved",
          verifiedBy: userId,
          verifiedAt: new Date(),
        });
        console.log(`   ↳ Created agent profile for commission tracking`);
      }
    } catch (error: any) {
      if (error.code === "23505") {
        console.log(`⚠️  ${account.role.toUpperCase()} account already exists: ${account.email}`);
      } else {
        console.error(`❌ Error creating ${account.role}: ${error.message}`);
      }
    }
  }

  console.log("\n🎉 INSA Test Accounts Creation Complete!");
  console.log("\n📝 Credentials saved to: INSA_Submission/5_Test_Credentials/test_credentials.csv");
  
  process.exit(0);
}

createTestAccounts().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
