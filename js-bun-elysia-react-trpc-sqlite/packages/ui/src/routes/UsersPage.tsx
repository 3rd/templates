import { formatDate } from "shared/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { trpc } from "../main";

export default function UsersPage() {
  const { data: usersData, isLoading } = trpc.users.list.useQuery();

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage your application users</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {usersData?.users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Joined {formatDate(new Date(user.createdAt))}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {usersData && <div className="text-sm text-muted-foreground">Total users: {usersData.total}</div>}
    </div>
  );
}
