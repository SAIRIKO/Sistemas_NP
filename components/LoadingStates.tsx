import { Skeleton } from "./ui/skeleton";

export function TableSkeleton() {
 return (
 <div className="space-y-6">
 <div className="flex justify-between items-center">
 <Skeleton className="h-8 w-[250px]" />
 </div>
 <div className="flex gap-4">
 <Skeleton className="h-10 w-[300px]" />
 <Skeleton className="h-10 w-[140px]" />
 <Skeleton className="h-10 w-[140px]" />
 <Skeleton className="h-10 w-[140px]" />
 </div>
 <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
 <div className="h-12 border-b bg-slate-50 dark:bg-slate-800/50 flex items-center px-4 gap-4">
 <Skeleton className="h-4 w-[35%]" />
 <Skeleton className="h-4 w-[25%]" />
 <Skeleton className="h-4 w-[20%]" />
 <Skeleton className="h-4 w-[10%]" />
 </div>
 {[...Array(5)].map((_, i) => (
 <div key={i} className="h-20 border-b flex items-center px-4 gap-4 p-4">
 <div className="w-[45%] space-y-2">
 <Skeleton className="h-4 w-full max-w-[280px]" />
 <Skeleton className="h-3 w-[100px]" />
 </div>
 <div className="w-[25%] space-y-2">
 <Skeleton className="h-4 w-[120px]" />
 </div>
 <div className="w-[20%] space-y-2">
 <Skeleton className="h-4 w-[80px]" />
 <Skeleton className="h-6 w-[100px] rounded-full" />
 </div>
 <div className="w-[10%]">
 <Skeleton className="h-4 w-[60px]" />
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}

export function KanbanSkeleton() {
 return (
 <div className="space-y-6">
 <div className="flex justify-between items-center">
 <Skeleton className="h-8 w-[250px]" />
 </div>
 <div className="flex gap-6 h-[calc(100vh-12rem)] overflow-hidden">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="w-[350px] shrink-0 flex flex-col gap-4">
 <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
 <Skeleton className="h-5 w-[150px]" />
 <Skeleton className="h-5 w-6 rounded-full" />
 </div>
 {[...Array(3)].map((_, j) => (
 <Skeleton key={j} className="h-[140px] w-full rounded-xl" />
 ))}
 </div>
 ))}
 </div>
 </div>
 );
}
