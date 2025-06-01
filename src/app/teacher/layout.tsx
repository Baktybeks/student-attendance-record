import { TeacherGuard } from "@/components/AuthGuard";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TeacherGuard>{children}</TeacherGuard>;
}
