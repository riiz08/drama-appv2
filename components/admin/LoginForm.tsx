"use client";

import { useState, useTransition } from "react";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { loginAction } from "@/app/actions/auth/login";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await loginAction(formData);

      if (!result.success) {
        setError(result.error || "Login gagal");
      }
      // If success, server action will redirect
    });
  };

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
            isDisabled={isPending}
            classNames={{
              input: "text-white",
              inputWrapper: "bg-zinc-800 border-zinc-700",
            }}
          />

          {/* Password Input */}
          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startContent={<Lock className="w-5 h-5 text-gray-400" />}
            isRequired
            isDisabled={isPending}
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
            isLoading={isPending}
            isDisabled={isPending}
          >
            {isPending ? "Memproses..." : "Login"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
