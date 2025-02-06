"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // TODO: Implement Supabase registration
      router.push("/auth/login");
    } catch (err) {
      setError("注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Activity className="h-6 w-6 text-gray-100" />
              <span className="ml-2 text-lg font-medium text-gray-100">AI医疗报告解读助手</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-gray-100"
                onClick={() => router.push("/auth/login")}
              >
                登录
              </Button>
              <Button
                className="bg-gray-100 hover:bg-white text-gray-900"
                onClick={() => router.push("/auth/register")}
              >
                注册
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center">
            <div className="bg-gray-800 p-3 rounded-xl shadow-lg mb-4">
              <UserPlus className="h-8 w-8 text-gray-100" />
            </div>
            <h2 className="text-2xl font-bold text-gray-100">注册新账号</h2>
            <p className="mt-2 text-gray-400 text-center">
              创建账号以使用AI医疗报告解读助手
            </p>
          </div>

          <Card className="p-6 bg-gray-900 border-gray-800">
            <form onSubmit={handleRegister} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-900">
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">邮箱地址</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200">确认密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gray-100 hover:bg-white text-gray-900"
                disabled={loading}
              >
                {loading ? "注册中..." : "注册"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                已有账号？{" "}
                <Link href="/auth/login" className="text-gray-300 hover:text-white">
                  立即登录
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}