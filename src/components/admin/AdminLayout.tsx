import { Link } from "@tanstack/react-router";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-stone-dark">
      <AdminSidebar className="fixed inset-y-0 left-0 w-64 hidden lg:flex" />
      
      <div className="flex flex-1 flex-col lg:pl-64">
        <AdminHeader title={title} />
        
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
