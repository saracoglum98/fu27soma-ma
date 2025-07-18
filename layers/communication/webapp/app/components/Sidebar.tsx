'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Navigation items
const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Knowledge Base', href: '/knowledge-base', icon: '📚' },
  { name: 'Functions', href: '/functions', icon: '⚙️' },
  { name: 'Solution Spaces', href: '/solution-spaces', icon: '🎯' },
  { name: 'Solutions', href: '/solutions', icon: '📈' },
  { name: 'Tests', href: '/tests', icon: '🧪' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center px-4">
        <h1 className="text-xl font-bold">{process.env.NEXT_PUBLIC_APP_NAME}</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
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
          );
        })}
      </nav>
    </div>
  );
} 