"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSigningIn(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("Sign-in failed:", error);
      setErrorMessage(
        "The email or password was incorrect."
      );
      setIsSigningIn(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  const inputClasses =
    "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SLYCEM HQ
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Admin Login
          </h1>

          <p className="mt-3 text-slate-400">
            Sign in to manage customer requests and print orders.
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-red-200">
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">
                Email
              </span>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className={inputClasses}
                placeholder="Your admin email"
                autoComplete="email"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-300">
                Password
              </span>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className={inputClasses}
                placeholder="Your password"
                autoComplete="current-password"
                required
              />
            </label>

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full rounded-xl bg-cyan-400 px-6 py-4 text-lg font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSigningIn ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}