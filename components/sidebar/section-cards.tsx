import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BookOpenIcon,
  ListTodoIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react"

type DashboardStats = {
  totalSignups: number
  totalCustomers: number
  totalCourses: number
  totalLessons: number
}

export function SectionCards({ data }: { data: DashboardStats }) {
  const cards = [
    {
      label: "Total Signups",
      value: data.totalSignups,
      description: "Registered users on the platform",
      icon: UsersIcon,
    },
    {
      label: "Total Customers",
      value: data.totalCustomers,
      description: "Users who have enrolled in courses",
      icon: ShoppingCartIcon,
    },
    {
      label: "Total Courses",
      value: data.totalCourses,
      description: "Available courses on the platform",
      icon: BookOpenIcon,
    },
    {
      label: "Total Lessons",
      value: data.totalLessons,
      description: "Total learning content available",
      icon: ListTodoIcon,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 px-4 lg:grid-cols-2 lg:px-8">
      {cards.map((item) => {
        const Icon = item.icon
        return (
          <Card
            key={item.label}
            className="min-h-44 rounded-sm border-border/80 bg-card py-0 shadow-xs"
          >
            <CardHeader className="px-7 pt-7">
              <CardDescription className="text-base tracking-wide">
                {item.label}
              </CardDescription>
              <CardTitle className="text-4xl font-medium tabular-nums text-card-foreground">
                {item.value}
              </CardTitle>
              <CardAction className="pt-2">
                <Icon className="size-7 text-muted-foreground" strokeWidth={1.7} />
              </CardAction>
            </CardHeader>
            <CardFooter className="mt-auto px-7 pb-7 text-base text-muted-foreground">
              {item.description}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
