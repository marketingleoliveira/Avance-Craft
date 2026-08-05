import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assertAdmin } from "@/lib/services/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/auth", search: { redirect: "/admin" } });
    }
    
    try {
      await assertAdmin(supabase, session.user.id);
    } catch (e) {
      console.error("Acesso administrativo negado:", e);
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Painel Administrativo | Avance" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});


function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-stone-light overflow-hidden">
      {/* Sidebar Desktop */}
      <AdminSidebar className="hidden w-64 lg:flex shrink-0" />

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Mobile */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transition-transform lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <AdminSidebar className="h-full" />
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute -right-12 top-4 bg-wood pixel-border border-wood-dark"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="lg:hidden h-16 border-b-4 border-stone-dark bg-stone flex items-center px-4 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <span className="font-pixel text-[10px] uppercase ml-4">Habblet Admin</span>
        </div>
        
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto bg-stone-light/50 p-6 [scrollbar-width:thin]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
