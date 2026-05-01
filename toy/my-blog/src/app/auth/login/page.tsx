import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-rose-50">
        <div className="animate-pulse text-lg tracking-widest text-violet-300">✦</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
