"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to /products when the page mounts
    router.replace("/product");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <main className="flex flex-col items-center justify-center text-center p-10">
        <h1 className="text-3xl font-bold text-blue-600 animate-pulse">
          Redirecting...
        </h1>
        <p className="text-gray-600 mt-4">
          Please wait while we take you to the products page.
        </p>
      </main>
    </div>
  );
}
