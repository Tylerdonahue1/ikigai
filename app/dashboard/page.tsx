import Dashboard from "@/components/dashboard"
import { mockUserData } from "@/lib/mock-data"

export default async function DashboardPage() {
  // First, try to use mock data for demonstration
  return <Dashboard initialData={mockUserData} id="demo" />
}

