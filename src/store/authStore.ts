import { create } from "zustand";
import { ScheduleWithDetails, WeekDay } from "@/types";

interface ScheduleState {
  currentWeek: Date;
  selectedDate: Date;
  selectedDay: WeekDay | null;
  schedule: ScheduleWithDetails[];

  // Действия
  setCurrentWeek: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedDay: (day: WeekDay | null) => void;
  setSchedule: (schedule: ScheduleWithDetails[]) => void;
  addScheduleItem: (item: ScheduleWithDetails) => void;
  updateScheduleItem: (
    id: string,
    updates: Partial<ScheduleWithDetails>
  ) => void;
  removeScheduleItem: (id: string) => void;

  // Вспомогательные функции
  getScheduleForDay: (day: WeekDay) => ScheduleWithDetails[];
  getScheduleForDate: (date: Date) => ScheduleWithDetails[];
}

// Функция для получения дня недели из даты
const getWeekDayFromDate = (date: Date): WeekDay => {
  const days = [
    WeekDay.SUNDAY,
    WeekDay.MONDAY,
    WeekDay.TUESDAY,
    WeekDay.WEDNESDAY,
    WeekDay.THURSDAY,
    WeekDay.FRIDAY,
    WeekDay.SATURDAY,
  ];
  return days[date.getDay()];
};

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  currentWeek: new Date(),
  selectedDate: new Date(),
  selectedDay: null,
  schedule: [],

  setCurrentWeek: (date: Date) => {
    set({ currentWeek: date });
  },

  setSelectedDate: (date: Date) => {
    const day = getWeekDayFromDate(date);
    set({
      selectedDate: date,
      selectedDay: day,
    });
  },

  setSelectedDay: (day: WeekDay | null) => {
    set({ selectedDay: day });
  },

  setSchedule: (schedule: ScheduleWithDetails[]) => {
    set({ schedule });
  },

  addScheduleItem: (item: ScheduleWithDetails) => {
    set((state) => ({
      schedule: [...state.schedule, item],
    }));
  },

  updateScheduleItem: (id: string, updates: Partial<ScheduleWithDetails>) => {
    set((state) => ({
      schedule: state.schedule.map((item) =>
        item.$id === id ? { ...item, ...updates } : item
      ),
    }));
  },

  removeScheduleItem: (id: string) => {
    set((state) => ({
      schedule: state.schedule.filter((item) => item.$id !== id),
    }));
  },

  getScheduleForDay: (day: WeekDay) => {
    const { schedule } = get();
    return schedule
      .filter((item) => item.dayOfWeek === day && item.isActive)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  },

  getScheduleForDate: (date: Date) => {
    const day = getWeekDayFromDate(date);
    return get().getScheduleForDay(day);
  },
}));
