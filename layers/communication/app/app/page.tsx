import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
      </div>
      <p className="text-gray-600">Welcome to dashboard.</p>
    </div>
  );
}
