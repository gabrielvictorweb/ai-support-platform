import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function LoginPage() {
  const session = await auth0.getSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">AI Support Platform</CardTitle>
          <CardDescription>
            Sign in to access your support dashboard
          </CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter>
          <a href="/auth/login" className="w-full">
            <Button className="w-full" size="lg">
              Sign in
            </Button>
          </a>
        </CardFooter>
      </Card>
    </main>
  );
}
