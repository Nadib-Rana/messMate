import { PrismaClient, Role, UserStatus, HouseRole, MemberStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding MessMate database...");

  const defaultPassword = await bcrypt.hash("messmate123", 10);

  // 1. Manager User: Nadib Rana
  const managerUser = await prisma.user.upsert({
    where: { email: "nadib@messmate.com" },
    update: {},
    create: {
      email: "nadib@messmate.com",
      username: "nadibrana",
      password: defaultPassword,
      firstName: "Nadib",
      lastName: "Rana",
      phoneNumber: "01711-000001",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    },
  });
  console.log(`✅ Manager User created: ${managerUser.firstName} ${managerUser.lastName}`);

  // 2. Members (6)
  const memberList = [
    { name: "Sumon", email: "sumon@messmate.com", phone: "01711-000002", plan: "Full" },
    { name: "Monna", email: "monna@messmate.com", phone: "01711-000003", plan: "Lunch + Dinner" },
    { name: "Foysan", email: "foysan@messmate.com", phone: "01711-000004", plan: "Full" },
    { name: "Azijul", email: "azijul@messmate.com", phone: "01711-000005", plan: "Full" },
    { name: "Shohan", email: "shohan@messmate.com", phone: "01711-000006", plan: "Lunch + Dinner" },
    { name: "Showhan", email: "showhan@messmate.com", phone: "01711-000007", plan: "Full" },
  ];

  const createdMemberUsers = [];
  for (const m of memberList) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        email: m.email,
        username: m.name.toLowerCase(),
        password: defaultPassword,
        firstName: m.name,
        lastName: "",
        phoneNumber: m.phone,
        role: Role.USER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
    });
    createdMemberUsers.push({ user, plan: m.plan });
    console.log(`✅ Member User created: ${user.firstName}`);
  }

  // 3. Create House for Nadib Rana (7 members total)
  const house = await prisma.house.upsert({
    where: { inviteCode: "HM-7777" },
    update: {},
    create: {
      name: "Bashundhara Mess",
      address: "Block B, Bashundhara R/A, Dhaka",
      description: "7-Member Bachelor Mess Managed by Nadib Rana",
      inviteCode: "HM-7777",
      settings: {
        create: {
          breakfastWeight: 0.5,
          lunchWeight: 1.0,
          dinnerWeight: 1.0,
          lowWalletThreshold: 500,
          guestMealRule: "Host Pays",
          fineAllocation: "House fund",
          dutyDurationDays: 3,
        },
      },
      members: {
        create: [
          { userId: managerUser.id, role: HouseRole.MANAGER, status: MemberStatus.ACTIVE, mealPlan: "Full" },
          ...createdMemberUsers.map(u => ({
            userId: u.user.id,
            role: HouseRole.MEMBER,
            status: MemberStatus.ACTIVE,
            mealPlan: u.plan,
          })),
        ],
      },
    },
  });
  console.log(`✅ House created with 7 members! Invite Code: ${house.inviteCode}`);

  console.log("🚀 MessMate Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
