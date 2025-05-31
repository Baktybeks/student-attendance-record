import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/types";

export function middleware(request: NextRequest) {
  const authStorage = request.cookies.get("auth-storage");
  let user = null;

  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage.value);
      user = parsed.state?.user;
    } catch (error) {
      console.error("Ошибка при разборе auth-storage:", error);
    }
  }

  const isAuthenticated = !!user;
  const isActive = user?.isActive === true;
  const path = request.nextUrl.pathname;

  // Публичные страницы - логин и регистрация
  if (path.startsWith("/login") || path.startsWith("/register")) {
    if (isAuthenticated && isActive) {
      return redirectByRole(user.role, request);
    }
    return NextResponse.next();
  }

  // Если пользователь не авторизован или не активирован
  if (!isAuthenticated || !isActive) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Защита маршрутов по ролям

  // Админ - доступ ко всем маршрутам /admin
  if (path.startsWith("/admin") && user.role !== UserRole.ADMIN) {
    return redirectByRole(user.role, request);
  }

  // Преподаватель - доступ к маршрутам /teacher
  if (
    path.startsWith("/teacher") &&
    ![UserRole.ADMIN, UserRole.TEACHER].includes(user.role)
  ) {
    return redirectByRole(user.role, request);
  }

  // Студент - доступ к маршрутам /student
  if (
    path.startsWith("/student") &&
    ![UserRole.ADMIN, UserRole.STUDENT].includes(user.role)
  ) {
    return redirectByRole(user.role, request);
  }

  // Общий дашборд - доступ для всех авторизованных пользователей
  if (path.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Перенаправление с главной страницы
  if (path === "/") {
    return redirectByRole(user.role, request);
  }

  return NextResponse.next();
}

function redirectByRole(role: UserRole, request: NextRequest) {
  let path: string;

  switch (role) {
    case UserRole.ADMIN:
      path = "/admin";
      break;
    case UserRole.TEACHER:
      path = "/teacher";
      break;
    case UserRole.STUDENT:
      path = "/student";
      break;
    default:
      path = "/login";
  }

  const url = new URL(path, request.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|public|favicon.ico).*)",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/",
  ],
};
