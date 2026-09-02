import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing all database data except Users, Houses, HouseSettings, and HouseMembers...");

  const result = await prisma.$transaction([
    prisma.memberSettlementSnapshot.deleteMany({}),
    prisma.monthlyClosing.deleteMany({}),
    prisma.dailyMealRecord.deleteMany({}),
    prisma.weeklySchedule.deleteMany({}),
    prisma.mealStopRequest.deleteMany({}),
    prisma.guestMeal.deleteMany({}),
    prisma.marketDuty.deleteMany({}),
    prisma.marketExpense.deleteMany({}),
    prisma.houseExpense.deleteMany({}),
    prisma.walletPayment.deleteMany({}),
    prisma.fine.deleteMany({}),
    prisma.notification.deleteMany({}),
    prisma.post.deleteMany({}),
    prisma.auditLog.deleteMany({}),
  ]);

  console.log("✅ Deleted records overview:");
  console.log(`- MemberSettlementSnapshots: ${result[0].count}`);
  console.log(`- MonthlyClosings: ${result[1].count}`);
  console.log(`- DailyMealRecords: ${result[2].count}`);
  console.log(`- WeeklySchedules: ${result[3].count}`);
  console.log(`- MealStopRequests: ${result[4].count}`);
  console.log(`- GuestMeals: ${result[5].count}`);
  console.log(`- MarketDuties: ${result[6].count}`);
  console.log(`- MarketExpenses: ${result[7].count}`);
  console.log(`- HouseExpenses: ${result[8].count}`);
  console.log(`- WalletPayments: ${result[9].count}`);
  console.log(`- Fines: ${result[10].count}`);
  console.log(`- Notifications: ${result[11].count}`);
  console.log(`- Posts: ${result[12].count}`);
  console.log(`- AuditLogs: ${result[13].count}`);

  const userCount = await prisma.user.count();
  const houseCount = await prisma.house.count();
  const houseMemberCount = await prisma.houseMember.count();

  console.log("\n📌 Remaining data in Database:");
  console.log(`- Users: ${userCount}`);
  console.log(`- Houses: ${houseCount}`);
  console.log(`- House Members: ${houseMemberCount}`);

  console.log("\n🎉 Database cleanup complete! Only Members and House remain.");
}

main()
  .catch((e) => {
    console.error("❌ Error clearing database data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
