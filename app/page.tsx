"use client";

import { Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HeroPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-900">
        <div className="w-full mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center ml-0">
              <Activity className="h-6 w-6 text-gray-100" />
              <span className="ml-2 text-lg font-medium text-gray-100">AI医疗报告解读助手</span>
            </div>
            <div className="flex items-center gap-8">
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

      {/* Hero Section */}
      <main className="flex-1 flex items-center">
        <div className="w-full mx-auto px-8 py-16">
          <div className="text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl font-medium text-gray-100 tracking-tight">
              智能解读医疗报告
              <span className="block text-gray-400 mt-2">让健康管理更简单</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              使用AI技术，将专业医学术语转化为易懂的解释
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className="bg-gray-100 hover:bg-white text-gray-900 px-8"
                onClick={() => router.push("/auth/register")}
              >
                开始使用
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-8">
        <div className="w-full mx-auto px-8">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">© 2024 AI医疗报告解读助手</span>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-400">隐私政策</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-400">使用条款</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}