"use client";

import { Upload, FileText, AlertCircle, Activity, Database, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { UploadCard } from "@/components/upload/upload-card";

export default function DashboardPage() {
  const router = useRouter();
  const [report, setReport] = useState<string>("");
  const [formattedReport, setFormattedReport] = useState<any>(null);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setReport(text);
      // Simple formatting example - in production this would be more sophisticated
      const formatted = {
        basicInfo: {
          date: "2024-03-26",
          hospital: "示例医院",
          department: "内科",
        },
        testResults: [
          {
            category: "血常规",
            items: [
              { name: "白细胞", value: "6.5", unit: "10^9/L", status: "normal" },
              { name: "红细胞", value: "4.8", unit: "10^12/L", status: "normal" },
            ]
          }
        ],
        analysis: [
          "各项指标基本正常",
          "建议定期复查",
          "保持良好的生活习惯"
        ]
      };
      setFormattedReport(formatted);
    };
    reader.readAsText(file);
  };

  const handleLogout = async () => {
    // TODO: Implement Supabase logout
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <header className="bg-gray-900 border-b border-gray-800">
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
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Upload Section */}
          
          <UploadCard onFileSelect={handleFileSelect} />

          {/* Report Analysis Section */}
          {formattedReport && (
            <Tabs defaultValue="formatted" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-800 rounded-lg">
                <TabsTrigger value="formatted" className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100">
                  格式化报告
                </TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100">
                  分析与建议
                </TabsTrigger>
              </TabsList>

              <TabsContent value="formatted">
                <Card className="p-6 bg-gray-900/80 backdrop-blur-sm shadow-lg border-gray-800">
                  <div className="border-l-4 border-gray-100 pl-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-100">基本信息</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    {Object.entries(formattedReport.basicInfo).map(([key, value]: [string, any]) => (
                      <div key={key} className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">{key === 'date' ? '检查日期' : key === 'hospital' ? '医院' : '科室'}</p>
                        <p className="font-medium text-gray-100">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-l-4 border-gray-100 pl-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-100">检验结果</h3>
                  </div>
                  {formattedReport.testResults.map((category: any, index: number) => (
                    <div key={index} className="mb-6">
                      <h4 className="font-medium mb-3 text-gray-100">{category.category}</h4>
                      <div className="bg-gray-800 rounded-xl p-4 shadow-inner">
                        {category.items.map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="flex justify-between py-3 border-b border-gray-700 last:border-0">
                            <span className="text-gray-200 font-medium">{item.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                item.status === "normal" 
                                  ? "bg-gray-700 text-gray-100" 
                                  : "bg-gray-100 text-gray-900"
                              }`}>
                                {item.value} {item.unit}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </Card>
              </TabsContent>

              <TabsContent value="analysis">
                <Card className="p-6 bg-gray-900/80 backdrop-blur-sm shadow-lg border-gray-800">
                  <Alert className="bg-gray-800 border-gray-700">
                    <AlertCircle className="h-4 w-4 text-gray-300" />
                    <AlertTitle className="text-gray-100">重要提示</AlertTitle>
                    <AlertDescription className="text-gray-300">
                      本分析仅供参考，具体诊断和治疗方案请遵医嘱。
                    </AlertDescription>
                  </Alert>

                  <div className="mt-8">
                    <div className="border-l-4 border-gray-100 pl-4 mb-6">
                      <h3 className="text-lg font-semibold text-gray-100">AI分析与建议</h3>
                    </div>
                    <ul className="space-y-4">
                      {formattedReport.analysis.map((item: string, index: number) => (
                        <li key={index} className="flex items-start bg-gray-800 p-4 rounded-xl">
                          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center mr-4 shadow-md">
                            {index + 1}
                          </span>
                          <span className="text-gray-200 pt-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}