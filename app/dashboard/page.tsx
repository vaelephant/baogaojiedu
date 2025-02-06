"use client";

import { Upload, FileText, AlertCircle, Activity, Database, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { UploadCard } from "@/components/upload/upload-card";
import { FileList } from "@/components/file/file-list";

export default function DashboardPage() {
  const router = useRouter();
  const [report, setReport] = useState<string>("");
  const [formattedReport, setFormattedReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("upload");

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0]; // 处理第一个文件
    try {
      // 读取文件内容
      const text = await file.text();
      setReport(text);
      
      // 模拟报告解析
      const formatted = {
        basicInfo: {
          date: new Date().toISOString().split('T')[0],
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
      // 自动切换到解读标签页
      setActiveTab("analysis");
      
    } catch (error) {
      console.error('Error processing file:', error);
      // 可以添加错误提示
    }
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-800 rounded-lg">
              <TabsTrigger value="upload" className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100">
                上传报告
              </TabsTrigger>
              <TabsTrigger value="files" className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100">
                文件管理
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100">
                报告解读
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <Card className="p-6 bg-gray-900/80 backdrop-blur-sm shadow-lg border-gray-800">
                <UploadCard 
                  onFileSelect={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt"
                  multiple={false}
                />
              </Card>
            </TabsContent>

            <TabsContent value="files">
              <Card className="p-6 bg-gray-900/80 backdrop-blur-sm shadow-lg border-gray-800">
                <div className="border-l-4 border-gray-100 pl-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-100">我的报告文件</h3>
                </div>
                <FileList />
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              {formattedReport ? (
                <Card className="p-6 bg-gray-900/80 backdrop-blur-sm shadow-lg border-gray-800">
                  <div className="grid gap-6">
                    {/* 基本信息 */}
                    <div>
                      <div className="border-l-4 border-gray-100 pl-4 mb-6">
                        <h3 className="text-lg font-semibold text-gray-100">基本信息</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        {Object.entries(formattedReport.basicInfo).map(([key, value]: [string, any]) => (
                          <div key={key} className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">
                              {key === 'date' ? '检查日期' : key === 'hospital' ? '医院' : '科室'}
                            </p>
                            <p className="font-medium text-gray-100">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 检验结果 */}
                    <div>
                      <div className="border-l-4 border-gray-100 pl-4 mb-6">
                        <h3 className="text-lg font-semibold text-gray-100">检验结果</h3>
                      </div>
                      {formattedReport.testResults.map((category: any, index: number) => (
                        <div key={index} className="mb-6">
                          <h4 className="font-medium mb-3 text-gray-100">{category.category}</h4>
                          <div className="bg-gray-800 rounded-xl p-4">
                            {category.items.map((item: any, itemIndex: number) => (
                              <div key={itemIndex} className="flex justify-between py-3 border-b border-gray-700 last:border-0">
                                <span className="text-gray-200">{item.name}</span>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-3 py-1 rounded-full text-sm ${
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
                    </div>

                    {/* AI 分析 */}
                    <div>
                      <div className="border-l-4 border-gray-100 pl-4 mb-6">
                        <h3 className="text-lg font-semibold text-gray-100">AI 分析与建议</h3>
                      </div>
                      <Alert className="bg-gray-800 border-gray-700 mb-4">
                        <AlertCircle className="h-4 w-4 text-gray-300" />
                        <AlertTitle className="text-gray-100">重要提示</AlertTitle>
                        <AlertDescription className="text-gray-300">
                          本分析仅供参考，具体诊断和治疗方案请遵医嘱。
                        </AlertDescription>
                      </Alert>
                      <ul className="space-y-4">
                        {formattedReport.analysis.map((item: string, index: number) => (
                          <li key={index} className="flex items-start bg-gray-800 p-4 rounded-xl">
                            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center mr-4">
                              {index + 1}
                            </span>
                            <span className="text-gray-200 pt-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 bg-gray-900/80 backdrop-blur-sm shadow-lg border-gray-800">
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-100 mb-2">
                      暂无报告解读
                    </h3>
                    <p className="text-gray-400 mb-4">
                      请先上传医疗报告文件进行解读
                    </p>
                    <Button
                      onClick={() => setActiveTab("upload")}
                      className="bg-gray-100 hover:bg-white text-gray-900"
                    >
                      上传报告
                    </Button>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}