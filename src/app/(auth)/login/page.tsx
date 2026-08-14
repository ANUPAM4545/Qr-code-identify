"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl });
  };

  const handleEmailSignIn = async () => {
    setIsLoading(true);
    await signIn("credentials", { 
      email, 
      password, 
      callbackUrl 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-6 w-full px-4 sm:px-0"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Welcome back</h2>
        <p className="text-sm text-zinc-500 font-medium">Sign in to your account to continue</p>
      </div>

      <div className="flex flex-col gap-5 mt-2">
        <Button 
          variant="outline" 
          onClick={handleGoogleSignIn} 
          disabled={isLoading}
          className="h-12 border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-zinc-500" />
          ) : (
            <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
          )}
          <span className="font-semibold text-sm">Continue with Google</span>
        </Button>
        
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <span className="bg-zinc-50 px-3">
              Or continue with email
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-xs text-zinc-600 font-bold uppercase tracking-wide">Work Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-zinc-200 bg-white hover:border-zinc-300 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-zinc-900/5 focus-visible:border-zinc-900 transition-all shadow-sm rounded-xl px-4"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs text-zinc-600 font-bold uppercase tracking-wide">Password</Label>
              <Link href="#" className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">Forgot?</Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-zinc-200 bg-white hover:border-zinc-300 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-zinc-900/5 focus-visible:border-zinc-900 transition-all shadow-sm rounded-xl px-4"
            />
          </div>
          <Button 
            className="w-full h-12 mt-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold" 
            onClick={handleEmailSignIn} 
            disabled={isLoading || !email || !password}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In with Email
          </Button>
          <p className="text-[11px] font-medium text-zinc-400 text-center mt-1">
            Local development mode enabled. Any password works.
          </p>
        </div>
      </div>

      <p className="text-sm font-medium text-center text-zinc-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-zinc-900 font-bold hover:underline decoration-zinc-300 underline-offset-4">
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-zinc-500" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
