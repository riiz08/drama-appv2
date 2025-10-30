import { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Admin Login | Mangeakkk Drama",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="text-white">Mangeakkk</span>
            <span className="text-red-500"> Drama</span>
          </h1>
          <p className="text-gray-400">Admin Dashboard</p>
        </div>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}
