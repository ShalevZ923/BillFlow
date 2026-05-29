import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function Login() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-background px-5">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Log in to BillFlow</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back</p>
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
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Log in
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Don&apos;t have an account?{" "}
            <Link className="font-medium text-primary hover:underline" href="/signup">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
