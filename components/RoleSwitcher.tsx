"use client";

import { useAppContext } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function RoleSwitcher() {
 const { role, setRole } = useAppContext();

 return (
 <div className="flex items-center gap-2">
 <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Perfil:</span>
 <Select value={role} onValueChange={(val) => { if (val === 'Diretor' || val === 'Admin') setRole(val); }}>
 <SelectTrigger className="w-[120px] h-8 text-sm focus:ring-0">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="Diretor">Diretor</SelectItem>
 <SelectItem value="Admin">Admin</SelectItem>
 </SelectContent>
 </Select>
 </div>
 );
}
