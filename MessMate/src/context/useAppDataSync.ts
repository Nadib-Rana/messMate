import { useEffect } from "react";
import { api } from "../services/api";

export function useAppDataSync(
  currentHouseId: string,
  setCurrentHouseId: (id: string) => void,
  setHouses: React.Dispatch<React.SetStateAction<any[]>>,
  setMembers: React.Dispatch<React.SetStateAction<any[]>>,
  setDailyMeals: React.Dispatch<React.SetStateAction<any[]>>,
  setWeeklySchedules: React.Dispatch<React.SetStateAction<any[]>>,
  setMealRequests: React.Dispatch<React.SetStateAction<any[]>>,
  setGuestMeals: React.Dispatch<React.SetStateAction<any[]>>,
  setMarketDuties: React.Dispatch<React.SetStateAction<any[]>>,
  setMarketExpenses: React.Dispatch<React.SetStateAction<any[]>>,
  setExpenses: React.Dispatch<React.SetStateAction<any[]>>,
  setWalletPayments: React.Dispatch<React.SetStateAction<any[]>>,
  setFines: React.Dispatch<React.SetStateAction<any[]>>,
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>,
  setMonthlyClosing: React.Dispatch<React.SetStateAction<any>>
) {
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveData() {
      try {
        let activeHouseId = currentHouseId;
        const myHouses = await api.getHouses().catch(() => null);
        if (myHouses && Array.isArray(myHouses) && myHouses.length > 0 && isMounted) {
          setHouses(myHouses);
          const matchedHouse = myHouses.find((h: any) => h.id === currentHouseId) || myHouses[0];
          activeHouseId = matchedHouse.id;
          if (currentHouseId !== activeHouseId) setCurrentHouseId(activeHouseId);
          if (matchedHouse.members?.length > 0) setMembers(matchedHouse.members);
        }
        const houseData = await api.getHouseDetails(activeHouseId).catch(() => null);
        if (houseData && isMounted) {
          setHouses(prev => [houseData, ...prev.filter(h => h.id !== houseData.id)]);
          if (houseData.members?.length > 0) setMembers(houseData.members);
        }
        const dailyMealsData = await api.getDailyMeals(activeHouseId).catch(() => null);
        if (dailyMealsData && Array.isArray(dailyMealsData) && isMounted) setDailyMeals(dailyMealsData);
        const weeklyData = await api.getWeeklySchedules(activeHouseId).catch(() => null);
        if (weeklyData && Array.isArray(weeklyData) && isMounted) setWeeklySchedules(weeklyData);
        const requestsData = await api.getMealRequests(activeHouseId).catch(() => null);
        if (requestsData && Array.isArray(requestsData) && isMounted) setMealRequests(requestsData);
        const guestsData = await api.getGuestMeals(activeHouseId).catch(() => null);
        if (guestsData && Array.isArray(guestsData) && isMounted) setGuestMeals(guestsData);
        const dutiesData = await api.getMarketDuties(activeHouseId).catch(() => null);
        if (dutiesData && Array.isArray(dutiesData) && isMounted) {
          const todayStr = new Date().toISOString().split("T")[0];
          setMarketDuties(dutiesData.map((d: any) => {
            let status = d.status || "upcoming";
            if (d.startDate && d.endDate) {
              if (todayStr >= d.startDate && todayStr <= d.endDate) status = "current";
              else if (todayStr > d.endDate) status = "completed";
              else status = "upcoming";
            }
            return { ...d, status };
          }));
        }
        const marketExpensesData = await api.getMarketExpenses(activeHouseId).catch(() => null);
        if (marketExpensesData && Array.isArray(marketExpensesData) && isMounted) setMarketExpenses(marketExpensesData);
        const billsData = await api.getBills(activeHouseId).catch(() => null);
        if (billsData && Array.isArray(billsData) && isMounted) setExpenses(billsData);
        const paymentsData = await api.getWallets(activeHouseId).catch(() => null);
        if (paymentsData && Array.isArray(paymentsData) && isMounted) setWalletPayments(paymentsData);
        const finesData = await api.getFines(activeHouseId).catch(() => null);
        if (finesData && Array.isArray(finesData) && isMounted) setFines(finesData);
        const notificationsData = await api.getNotifications(activeHouseId).catch(() => null);
        if (notificationsData && Array.isArray(notificationsData) && isMounted) setNotifications(notificationsData);
        const settlementData = await api.getSettlement(activeHouseId).catch(() => null);
        if (settlementData && isMounted) setMonthlyClosing(settlementData);
      } catch (err) {
        console.error("Live API Sync Error:", err);
      }
    }
    fetchLiveData();
    return () => { isMounted = false; };
  }, [currentHouseId]);
}
