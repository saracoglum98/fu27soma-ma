'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconDashboard, IconBook2, IconTrophy, IconSettings, IconPackages, IconChartLine, IconReportAnalytics } from '@tabler/icons-react';

// Navigation items
const navigation = [
  { name: 'Dashboard', href: '/', icon: <IconDashboard size={20} />, divider: true },
  { name: 'Knowledge Base', href: '/knowledge-base', icon: <IconBook2 size={20} />},
  { name: 'KPIs', href: '/kpis', icon: <IconTrophy size={20} />, divider: true},
  { name: 'Functions', href: '/functions', icon: <IconSettings size={20} /> },
  { name: 'Solution Spaces', href: '/solution-spaces', icon: <IconPackages size={20} />, divider: true},
  { name: 'Solutions', href: '/solutions', icon: <IconReportAnalytics size={20} />},
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center px-4">
        <h1 className="text-xl font-bold">{process.env.NEXT_PUBLIC_APP_NAME}</h1>
      </div>
      <nav className="flex-1 space-y-0 px-2 py-4">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
              {item.divider && (
                <div className="my-2 mx-3 border-t border-gray-700" />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
} 