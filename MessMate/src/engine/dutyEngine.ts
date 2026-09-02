import { MarketDuty, Member } from "../types";

export function getActiveMarketDuty(duties: MarketDuty[]): MarketDuty | undefined {
  return duties.find(d => d.status === "current");
}

function formatDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split("-").map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0);
  }
  return new Date(dateStr);
}

export function generateRotationSchedule(
  members: Member[],
  startDateInput: Date | string,
  durationDays: number = 3,
  periodsCount: number = 5
): { period: string; startDate: string; endDate: string; member: Member }[] {
  const schedule: { period: string; startDate: string; endDate: string; member: Member }[] = [];
  const activeMembers = members.filter(m => m.status === "active");
  if (activeMembers.length === 0) return schedule;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let currentStart = typeof startDateInput === "string"
    ? parseLocalDate(startDateInput)
    : new Date(startDateInput.getFullYear(), startDateInput.getMonth(), startDateInput.getDate());

  for (let i = 0; i < periodsCount; i++) {
    const currentEnd = new Date(currentStart.getFullYear(), currentStart.getMonth(), currentStart.getDate() + durationDays - 1);

    const sIso = formatDateStr(currentStart);
    const eIso = formatDateStr(currentEnd);
    const periodStr = `${monthNames[currentStart.getMonth()]} ${currentStart.getDate()}–${currentEnd.getDate()}`;
    const member = activeMembers[i % activeMembers.length];

    schedule.push({ period: periodStr, startDate: sIso, endDate: eIso, member });

    // Move to next start
    currentStart = new Date(currentEnd.getFullYear(), currentEnd.getMonth(), currentEnd.getDate() + 1);
  }

  return schedule;
}

