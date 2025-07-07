import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, User, Settings, LogOut, MoreHorizontal } from "lucide-react";

export default function Home() {
  // Mock data for flows - in real app this would come from API
  const flows = [
    {
      id: 1,
      name: "Customer Support Flow",
      description: "Main customer support contact driver mapping",
      lastModified: "2024-01-15",
      status: "Active"
    },
    {
      id: 2,
      name: "Sales Inquiry Flow",
      description: "Lead generation and sales intent mapping",
      lastModified: "2024-01-14",
      status: "Draft"
    },
    {
      id: 3,
      name: "Product Return Flow",
      description: "Return process and refund request mapping",
      lastModified: "2024-01-13",
      status: "Active"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="border-b bg-white/50 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left side - Brand */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-foreground">CxFlow Designer</h1>
          </div>

          {/* Right side - Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100">
                  <User className="h-5 w-5 text-stone-600" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">CX Flows</h2>
              <p className="text-muted-foreground">
                Manage your customer experience flows and contact drivers
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Flow
            </Button>
          </div>

          {/* Flows Table */}
          <Card>
            <CardHeader>
              <CardTitle>Your Flows</CardTitle>
              <CardDescription>
                Manage and organize your customer experience flow designs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-3">
                  <div className="col-span-1">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </div>
                  <div className="col-span-4">Name</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">Last Modified</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Actions</div>
                </div>

                {/* Table Rows */}
                {flows.map((flow) => (
                  <div key={flow.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-b-0 hover:bg-muted/50">
                    <div className="col-span-1">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </div>
                    <div className="col-span-4">
                      <div className="font-medium">{flow.name}</div>
                    </div>
                    <div className="col-span-3">
                      <div className="text-sm text-muted-foreground">{flow.description}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-muted-foreground">{flow.lastModified}</div>
                    </div>
                    <div className="col-span-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        flow.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {flow.status}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Bulk Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {flows.length} flow{flows.length !== 1 ? 's' : ''} total
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
