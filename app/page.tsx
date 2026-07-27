"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  
  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          toast.success("Signed out successfully");
        },
        onError: () => {
          toast.error("Internal Server Error");
        },
      },
    });
  }

  return (
    <div>
      <h1>Hello world</h1>
      <ThemeToggle />
      {session ? <div>
        <p>{session.user?.name}</p>
        <Button onClick={signOut}>Log Out</Button>
      </div>
: <Button onClick={() => router.push("/login")}>Login</Button>}

    </div>
  );
}
