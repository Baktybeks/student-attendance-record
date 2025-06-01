// src/app/student/layout.tsx

import { StudentGuard } from "@/components/AuthGuard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentGuard>{children}</StudentGuard>;
}
