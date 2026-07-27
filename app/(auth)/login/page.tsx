import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGithub } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>Login with your Github Email Account</CardDescription>
      </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <Button className="w-full">
                <FaGithub className="h-4 w-4" />
                Sign in with GitHub
            </Button>

            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-0.5 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 br-card px-2 text-muted-foreground">Or continue with</span>
            </div>

            <div className="grid gap-3">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" />
              </div>
              <Button>Continue with Email</Button>

            </div>

        </CardContent>

    </Card>
  );
}