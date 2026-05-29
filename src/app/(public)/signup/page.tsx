import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function Signup() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-background px-5">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Start tracking bills in minutes</p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="8+ characters"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Already have an account?{" "}
            <Link className="font-medium text-primary hover:underline" href="/login">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
