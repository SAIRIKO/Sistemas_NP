"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "./AppShell";
import { AuthGuard } from "./AuthGuard";

// Pages that don't need the AppShell (sidebar/header) or auth
const AUTH_ROUTES = ["/login", "/register"];
// Routes with their own shell (portal selector + YMed interface)
const SHELL_FREE_ROUTES = ["/portal", "/admin"];
const YMED_PREFIX = "/ymed";

export function AppShellWrapper({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const isAuthRoute = AUTH_ROUTES.includes(pathname);
 const isShellFree = SHELL_FREE_ROUTES.includes(pathname) || pathname.startsWith(YMED_PREFIX);

 if (isAuthRoute) {
 // Login/register render without shell or auth protection
 return <>{children}</>;
 }

 if (isShellFree) {
 // Portal and YMed have their own layout/shell
 return <AuthGuard>{children}</AuthGuard>;
 }

 return (
 <AuthGuard>
 <AppShell>{children}</AppShell>
 </AuthGuard>
 );
}
