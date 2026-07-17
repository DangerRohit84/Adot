"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === "super_admin") router.push("/admin");
      else if (userData.role === "college_admin") router.push("/college");
      else if (userData.role === "hod") router.push("/hod");
      else if (userData.role === "teacher") router.push("/teacher");
      else router.push("/scanner");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
