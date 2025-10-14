"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import {
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeClosed,
  EyeIcon,
  EyeClosedIcon,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

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

      if (result?.error) {
        setError("Email atau password salah");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <Card className="bg-zinc-900 border border-zinc-800">
      <CardBody className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Email Input */}
          <Input
            type="email"
            label="Email"
            placeholder="admin@mangeakkk.my.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startContent={<Mail className="w-5 h-5 text-gray-400" />}
            isRequired
            classNames={{
              input: "text-white",
              inputWrapper: "bg-zinc-800 border-zinc-700",
            }}
          />

          {/* Password Input */}
          <Input
            endContent={
              <button
                aria-label="toggle password visibility"
                className="focus:outline-solid outline-transparent"
                type="button"
                onClick={toggleVisibility}
              >
                {isVisible ? (
                  <EyeIcon className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <EyeClosedIcon className="text-2xl text-default-400 pointer-events-none" />
                )}
              </button>
            }
            label="Password"
            placeholder="Enter your password"
            type={isVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startContent={<Lock className="w-5 h-5 text-gray-400" />}
            isRequired
            classNames={{
              input: "text-white",
              inputWrapper: "bg-zinc-800 border-zinc-700",
            }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            color="danger"
            size="lg"
            className="w-full font-semibold"
            isLoading={isLoading}
          >
            {isLoading ? "Memproses..." : "Login"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
