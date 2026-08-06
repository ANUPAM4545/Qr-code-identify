"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleEmailSignUp = async () => {
    setIsLoading(true);
    await signIn("credentials", { 
      email, 
      password, 
      callbackUrl: "/dashboard" 
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full px-4 sm:px-0">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Create an account</h2>
        <p className="text-sm text-zinc-500">Start managing enterprise events today</p>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <Button 
          variant="outline" 
          onClick={handleGoogleSignUp} 
          disabled={isLoading}
          className="h-11 border-zinc-200 text-zinc-900 hover:bg-zinc-50 shadow-sm transition-colors"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-500" />
          ) : (
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
          )}
          Sign up with Google
        </Button>
        
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-zinc-400 font-medium">
              Or continue with email
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-xs text-zinc-600 font-medium">Work Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 border-zinc-200 bg-white focus-visible:ring-1 focus-visible:ring-zinc-900 shadow-sm transition-shadow"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-xs text-zinc-600 font-medium">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 border-zinc-200 bg-white focus-visible:ring-1 focus-visible:ring-zinc-900 shadow-sm transition-shadow"
            />
          </div>
          <Button 
            className="w-full h-11 mt-2 bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm transition-colors" 
            onClick={handleEmailSignUp} 
            disabled={isLoading || !email || !password}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign Up
          </Button>
        </div>
      </div>

      <p className="text-[11px] text-center text-zinc-500 mt-4 px-4">
        By clicking continue, you agree to our{" "}
        <Link href="/terms" className="text-zinc-900 font-medium hover:underline">Terms of Service</Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-zinc-900 font-medium hover:underline">Privacy Policy</Link>.
      </p>

      <p className="text-sm text-center text-zinc-500 mt-2">
        Already have an account?{" "}
        <Link href="/login" className="text-zinc-900 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
