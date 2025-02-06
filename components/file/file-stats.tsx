import { Card } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

interface FileStats {
  totalFiles: number;
  totalSize: number;
  typeDistribution: {
    name: string;
    value: number;
  }[];
  uploadTrend: {
    date: string;
    count: number;
  }[];
}

interface FileStatsProps {
  files: any[];
}

export function FileStats({ files }: FileStatsProps) {
  // 计算文件类型分布
  const typeDistribution = files.reduce((acc, file) => {
    const type = file.type.split('/')[0] || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(typeDistribution).map(([name, value]) => ({
    name,
    value
  }));

  // 计算上传趋势
  const uploadTrend = files.reduce((acc, file) => {
    const date = new Date(file.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const trendData = Object.entries(uploadTrend).map(([date, count]) => ({
    date,
    count
  }));

  // 计算总文件大小
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">文件类型分布</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">上传趋势</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="文件数量" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 md:col-span-2">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h4 className="text-sm font-medium text-gray-500">总文件数</h4>
            <p className="text-2xl font-bold">{files.length}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">总存储空间</h4>
            <p className="text-2xl font-bold">
              {(totalSize / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">文件类型数</h4>
            <p className="text-2xl font-bold">{typeData.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
} 