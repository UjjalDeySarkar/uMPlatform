import { AppSidebar } from "@/components/AppSidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const user = data?.user?.user_metadata

  return (
    <>
      <SidebarProvider>
        <AppSidebar user={user} className="pt-10"/>
        <SidebarTrigger className="-ml-1" />
        <main className="flex-1 p-2">{children}</main>
      </SidebarProvider>
    </>
  )
}