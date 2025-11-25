"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Mail, Lock, AlertCircle, EyeIcon, EyeClosedIcon } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("📤 SignIn result:", result);

      if (result?.error) {
        console.error("❌ Login error:", result.error);
        setError("Email atau password salah");
        setIsLoading(false);
      } else if (result?.ok) {
        console.log("✅ Login successful, redirecting...");

        // ✅ Force hard refresh untuk ensure middleware membaca session
        window.location.href = "/admin";
      }
    } catch (err) {
      console.error("❌ Exception:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-zinc-900 border border-zinc-800">
      <CardBody className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <Input
            type="email"
            label="Email"
            placeholder="admin@mangeakkk.my.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startContent={<Mail className="w-5 h-5 text-gray-400" />}
            isRequired
            autoComplete="email"
            classNames={{
              input: "text-white",
              inputWrapper: "bg-zinc-800 border-zinc-700",
            }}
          />

          <Input
            type={isVisible ? "text" : "password"}
            label="Password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startContent={<Lock className="w-5 h-5 text-gray-400" />}
            endContent={
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="focus:outline-none"
              >
                {isVisible ? (
                  <EyeIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <EyeClosedIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
            }
            isRequired
            autoComplete="current-password"
            classNames={{
              input: "text-white",
              inputWrapper: "bg-zinc-800 border-zinc-700",
            }}
          />

          <Button
            type="submit"
            color="danger"
            size="lg"
            className="w-full font-semibold"
            isLoading={isLoading}
            isDisabled={!email || !password || isLoading}
          >
            {isLoading ? "Memproses..." : "Login"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
