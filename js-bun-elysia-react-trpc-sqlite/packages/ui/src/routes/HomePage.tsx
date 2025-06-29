import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { trpc } from "../main";

export default function HomePage() {
  const { data: helloData } = trpc.hello.useQuery({ name: "World" });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to My Project</h1>
        <p className="mt-2 text-xl text-muted-foreground">Starter kit</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>tRPC API</CardTitle>
            <CardDescription>Type-safe API calls with automatic TypeScript inference</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                Message from API: <strong>{helloData?.message}</strong>
              </p>
              <p className="text-xs text-muted-foreground">Timestamp: {helloData?.timestamp}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>React + TypeScript</CardTitle>
            <CardDescription>Modern React with full TypeScript support</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Built with React 19, TypeScript 5, and Vite for fast development.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tailwind CSS</CardTitle>
            <CardDescription>Utility-first CSS framework with shadcn/ui components</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Beautiful, responsive design with pre-built component library.</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button className="mr-4">Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </div>
  );
}
