import { MarketDuty, Member } from "../types";

export function getActiveMarketDuty(duties: MarketDuty[]): MarketDuty | undefined {
  return duties.find(d => d.status === "current");
}

export function generateRotationSchedule(
  members: Member[],
  startDate: Date,
  durationDays: number = 3,
  periodsCount: number = 5
): { period: string; member: Member }[] {
  const schedule: { period: string; member: Member }[] = [];
  const activeMembers = members.filter(m => m.status === "active");
  if (activeMembers.length === 0) return schedule;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let currentStart = new Date(startDate);

  for (let i = 0; i < periodsCount; i++) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + durationDays - 1);

    const periodStr = `${monthNames[currentStart.getMonth()]} ${currentStart.getDate()}–${currentEnd.getDate()}`;
    const member = activeMembers[i % activeMembers.length];

    schedule.push({ period: periodStr, member });

    // Move to next start
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }

  return schedule;
}
