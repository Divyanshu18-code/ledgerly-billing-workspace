import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Search,
  FileText,
  DollarSign,
  Receipt,
  Users,
  Info,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  type NotificationItem,
} from '../hooks/useNotifications';
import { NotificationPreferencesModal } from '../components/NotificationPreferencesModal';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [readState, setReadState] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  const queryFilter: any = { limit: 50 };
  if (readState === 'UNREAD') queryFilter.isRead = 'false';
  if (readState === 'READ') queryFilter.isRead = 'true';
  if (filterType !== 'ALL') queryFilter.type = filterType;
  if (search.trim()) queryFilter.search = search.trim();

  const { data, isLoading } = useNotificationsQuery(queryFilter);
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INVOICE_CREATED':
      case 'INVOICE_PAID':
      case 'INVOICE_OVERDUE':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'PAYMENT_RECEIVED':
        return <DollarSign className="h-5 w-5 text-emerald-500" />;
      case 'EXPENSE_ADDED':
        return <Receipt className="h-5 w-5 text-rose-500" />;
      case 'TEAM_INVITATION':
        return <Users className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-amber-500" />;
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id);
    }

    if (item.entityType === 'INVOICE' && item.entityId) {
      navigate(`/invoices/${item.entityId}`);
    } else if (item.entityType === 'QUOTATION' && item.entityId) {
      navigate(`/quotations/${item.entityId}`);
    } else if (item.entityType === 'PAYMENT') {
      navigate('/payments');
    } else if (item.entityType === 'EXPENSE') {
      navigate('/expenses');
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
            Notification Center
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time business updates, audit alerts, and team events
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All Read</span>
            </button>
          )}

          <button
            onClick={() => setIsPrefsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:border-blue-500/30 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#121118]/80 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Read State Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/5">
              {['ALL', 'UNREAD', 'READ'].map((st) => (
                <button
                  key={st}
                  onClick={() => setReadState(st)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    readState === st
                      ? 'bg-white dark:bg-[#121118] text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'UNREAD' ? `Unread (${unreadCount})` : 'Read'}
                </button>
              ))}
            </div>

            {/* Type Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/5">
              {[
                { id: 'ALL', label: 'All Events' },
                { id: 'INVOICE_CREATED', label: 'Invoices' },
                { id: 'PAYMENT_RECEIVED', label: 'Payments' },
                { id: 'EXPENSE_ADDED', label: 'Expenses' },
              ].map((tp) => (
                <button
                  key={tp.id}
                  onClick={() => setFilterType(tp.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterType === tp.id
                      ? 'bg-white dark:bg-[#121118] text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Notifications List */}
      <div className="rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#121118]/80 backdrop-blur-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-400">
            Loading notification feed...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Bell className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              No notifications found
            </h3>
            <p className="text-xs text-gray-400">
              You are completely caught up! New business events will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group p-4 flex items-start gap-4 transition-all cursor-pointer ${
                  !item.isRead
                    ? 'bg-blue-50/40 dark:bg-blue-500/5 hover:bg-blue-50/80 dark:hover:bg-blue-500/10'
                    : 'hover:bg-gray-50/80 dark:hover:bg-white/5'
                }`}
              >
                {/* Type Icon */}
                <div className="p-2.5 rounded-xl border border-gray-200/60 dark:border-white/10 bg-white dark:bg-white/5 shrink-0 shadow-xs">
                  {getNotificationIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-bold truncate ${
                        !item.isRead
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300 font-semibold'
                      }`}
                    >
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                        {new Date(item.createdAt).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>

                      {!item.isRead && (
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(item.id);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
      />
    </div>
  );
};
