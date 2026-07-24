import React, { useState } from 'react';
import {
  Activity,
  Search,
  User,
  Clock,
  ShieldCheck,
  FileText,
  DollarSign,
  Receipt,
  Users,
  Box,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useActivityLogsQuery } from '../hooks/useActivityLogs';

export const ActivityLogsPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const queryFilter: any = { page, limit: 20 };
  if (selectedModule !== 'ALL') queryFilter.module = selectedModule;
  if (search.trim()) queryFilter.search = search.trim();

  const { data, isLoading } = useActivityLogsQuery(queryFilter);

  const logs = data?.logs || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const getModuleIcon = (module: string) => {
    switch (module?.toUpperCase()) {
      case 'INVOICE':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'PAYMENT':
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case 'EXPENSE':
        return <Receipt className="h-4 w-4 text-rose-500" />;
      case 'CLIENT':
      case 'TEAM':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'PRODUCT':
        return <Box className="h-4 w-4 text-amber-500" />;
      case 'WORKSPACE':
      case 'SETTINGS':
        return <Settings className="h-4 w-4 text-teal-500" />;
      default:
        return <ShieldCheck className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
            Activity & Audit Trail
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Immutable log stream of user actions, system modifications, and security events
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Workspace Audit Lock Active</span>
        </div>
      </div>

      {/* Module Filter Pills & Search */}
      <div className="p-4 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#121118]/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Module Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Modules' },
              { id: 'INVOICE', label: 'Invoices' },
              { id: 'PAYMENT', label: 'Payments' },
              { id: 'EXPENSE', label: 'Expenses' },
              { id: 'CLIENT', label: 'Clients' },
              { id: 'PRODUCT', label: 'Products' },
              { id: 'WORKSPACE', label: 'Workspace' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedModule(m.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedModule === m.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by description or action..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#121118]/80 backdrop-blur-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Activity className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              No activity logs recorded
            </h3>
            <p className="text-xs text-gray-400">
              Actions taken by team members will be logged here chronologically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {logs.map((log) => {
              const userName = log.user
                ? `${log.user.firstName} ${log.user.lastName}`
                : 'System Process';

              return (
                <div
                  key={log.id}
                  className="p-4 flex items-start gap-4 hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors"
                >
                  {/* Module Badge Icon */}
                  <div className="p-2.5 rounded-xl border border-gray-200/60 dark:border-white/10 bg-white dark:bg-white/5 shrink-0 shadow-xs">
                    {getModuleIcon(log.module)}
                  </div>

                  {/* Log Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                          {log.action}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                          {log.description}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 shrink-0 font-mono">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {new Date(log.createdAt).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'medium',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400 pt-0.5">
                      <div className="flex items-center gap-1 font-medium">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span>{userName}</span>
                      </div>

                      {log.module && (
                        <span className="text-gray-400 font-mono text-[10px]">
                          [{log.module}]
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Page <span className="font-bold text-gray-900 dark:text-white">{page}</span> of{' '}
              <span className="font-bold text-gray-900 dark:text-white">{pagination.totalPages}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
