// src/hooks/useScheduleWithDetails.ts

import { useMemo } from "react";
import { useScheduleByTeacher } from "@/services/scheduleService";
import { useAllSubjects } from "@/services/subjectService";
import { useAllGroups } from "@/services/groupeServise";
import { Schedule, Subject, Group, WeekDay } from "@/types";

// Интерфейс для элемента расписания с полными данными
export interface ScheduleItemWithDetails {
  id: string;
  subject: string; // Название предмета
  subjectCode: string; // Код предмета
  group: string; // Название группы
  groupCode: string; // Код группы
  time: string;
  classroom: string;
  dayOfWeek: WeekDay;
  weekType: "all" | "odd" | "even";
  type?: "lecture" | "seminar" | "practice" | "lab";
  // Дополнительные поля для отладки
  subjectId: string;
  groupId: string;
  teacherId: string;
}

export const useScheduleWithDetails = (teacherId: string) => {
  // Получаем все необходимые данные
  const { data: scheduleData = [], isLoading: isScheduleLoading } =
    useScheduleByTeacher(teacherId);
  const { data: subjectsData = [], isLoading: isSubjectsLoading } =
    useAllSubjects();
  const { data: groupsData = [], isLoading: isGroupsLoading } = useAllGroups();

  // Создаем маппинги для быстрого поиска
  const subjectsMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjectsData.forEach((subject) => map.set(subject.$id, subject));
    return map;
  }, [subjectsData]);

  const groupsMap = useMemo(() => {
    const map = new Map<string, Group>();
    groupsData.forEach((group) => map.set(group.$id, group));
    return map;
  }, [groupsData]);

  // Преобразуем данные расписания
  const scheduleWithDetails = useMemo((): ScheduleItemWithDetails[] => {
    if (!scheduleData.length || !subjectsData.length || !groupsData.length) {
      return [];
    }

    return scheduleData.map(
      (scheduleItem: Schedule): ScheduleItemWithDetails => {
        const subject = subjectsMap.get(scheduleItem.subjectId);
        const group = groupsMap.get(scheduleItem.groupId);

        return {
          id: scheduleItem.$id,
          subject: subject?.name || `Предмет (${scheduleItem.subjectId})`,
          subjectCode: subject?.code || "N/A",
          group: group?.name || `Группа (${scheduleItem.groupId})`,
          groupCode: group?.code || "N/A",
          time: `${scheduleItem.startTime} - ${scheduleItem.endTime}`,
          classroom: scheduleItem.classroom,
          dayOfWeek: scheduleItem.dayOfWeek,
          weekType: scheduleItem.weekType || "all",
          type: "lecture", // Можно добавить это поле в Schedule если нужно
          // Отладочные поля
          subjectId: scheduleItem.subjectId,
          groupId: scheduleItem.groupId,
          teacherId: scheduleItem.teacherId,
        };
      }
    );
  }, [scheduleData, subjectsMap, groupsMap]);

  const isLoading = isScheduleLoading || isSubjectsLoading || isGroupsLoading;

  return {
    data: scheduleWithDetails,
    isLoading,
    rawScheduleData: scheduleData,
    subjectsMap,
    groupsMap,
  };
};
