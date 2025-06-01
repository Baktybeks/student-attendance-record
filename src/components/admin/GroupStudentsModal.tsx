import {
  useStudentsByGroup,
  useStudentsWithoutGroup,
  useAddStudentToGroup,
  useRemoveStudentFromGroup,
  useTransferStudent,
  useBulkAddStudentsToGroup,
} from "@/services/groupeStudentsServise";
import { Group } from "@/types";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  GraduationCap,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  UserMinus,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

interface GroupStudentsModalProps {
  group: Group;
  onClose: () => void;
}

function GroupStudentsModal({ group, onClose }: GroupStudentsModalProps) {
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Data fetching
  const { data: groupStudents = [], isLoading: studentsLoading } =
    useStudentsByGroup(group.$id);
  const { data: availableStudents = [], isLoading: availableLoading } =
    useStudentsWithoutGroup();

  // Mutations
  const addStudentMutation = useAddStudentToGroup();
  const removeStudentMutation = useRemoveStudentFromGroup();
  const bulkAddMutation = useBulkAddStudentsToGroup();

  // Фильтрация доступных студентов
  const filteredAvailableStudents = availableStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = async (studentId: string) => {
    try {
      await addStudentMutation.mutateAsync({ studentId, groupId: group.$id });
      toast.success("Студент добавлен в группу");
    } catch (error: any) {
      toast.error(error.message || "Ошибка при добавлении студента");
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (window.confirm("Удалить студента из группы?")) {
      try {
        await removeStudentMutation.mutateAsync({
          studentId,
          groupId: group.$id,
        });
        toast.success("Студент удален из группы");
      } catch (error: any) {
        toast.error(error.message || "Ошибка при удалении студента");
      }
    }
  };

  const handleBulkAdd = async () => {
    if (selectedStudents.length === 0) {
      toast.warning("Выберите студентов для добавления");
      return;
    }

    try {
      await bulkAddMutation.mutateAsync({
        studentIds: selectedStudents,
        groupId: group.$id,
      });
      toast.success(`${selectedStudents.length} студентов добавлено в группу`);
      setSelectedStudents([]);
      setShowAddStudents(false);
    } catch (error: any) {
      toast.error(error.message || "Ошибка при добавлении студентов");
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Заголовок */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Студенты группы {group.name}
              </h3>
              <p className="text-slate-600 mt-1">
                {groupStudents.length} студентов в группе
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddStudents(!showAddStudents)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Добавить студентов</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Список студентов группы */}
          <div className="flex-1 p-6">
            <h4 className="text-lg font-medium text-slate-900 mb-4">
              Студенты в группе
            </h4>

            {studentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-slate-600">Загрузка...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {groupStudents.map((student) => (
                  <div
                    key={student.$id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-medium text-slate-900">
                          {student.name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {student.email}
                          </span>
                          {student.studentId && (
                            <span className="flex items-center">
                              <GraduationCap className="w-3 h-3 mr-1" />
                              {student.studentId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveStudent(student.$id)}
                      disabled={removeStudentMutation.isPending}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Удалить из группы"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {groupStudents.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">
                      В группе пока нет студентов
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Панель добавления студентов */}
          {showAddStudents && (
            <div className="w-1/2 border-l border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-slate-900">
                  Доступные студенты
                </h4>

                {selectedStudents.length > 0 && (
                  <button
                    onClick={handleBulkAdd}
                    disabled={bulkAddMutation.isPending}
                    className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    Добавить ({selectedStudents.length})
                  </button>
                )}
              </div>

              {/* Поиск */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Поиск студентов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {availableLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-slate-600">Загрузка...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredAvailableStudents.map((student) => (
                    <div
                      key={student.$id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStudents.includes(student.$id)
                          ? "bg-blue-50 border-blue-300"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                      onClick={() => toggleStudentSelection(student.$id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.$id)}
                          onChange={() => toggleStudentSelection(student.$id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />

                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-600">
                            {student.email}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddStudent(student.$id);
                        }}
                        disabled={addStudentMutation.isPending}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                        title="Добавить в группу"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {filteredAvailableStudents.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600 text-sm">
                        {searchTerm
                          ? "Студенты не найдены"
                          : "Нет доступных студентов"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupStudentsModal;
