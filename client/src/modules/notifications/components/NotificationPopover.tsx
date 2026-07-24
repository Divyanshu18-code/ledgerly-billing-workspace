import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  FileText,
  DollarSign,
  Receipt,
  Users,
  Settings,
  Info,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  type NotificationItem,
} from '../hooks/useNotifications';

export const NotificationPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data, isLoading } = useNotificationsQuery({ limit: 10 });
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INVOICE_CREATED':
      case 'INVOICE_PAID':
      case 'INVOICE_OVERDUE':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'PAYMENT_RECEIVED':
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case 'EXPENSE_ADDED':
        return <Receipt className="h-4 w-4 text-rose-500" />;
      case 'TEAM_INVITATION':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'WORKSPACE_UPDATED':
        return <Settings className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-teal-500" />;
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id);
    }
    setIsOpen(false);

    if (item.entityType === 'INVOICE' && item.entityId) {
      navigate(`/invoices/${item.entityId}`);
    } else if (item.entityType === 'QUOTATION' && item.entityId) {
      navigate(`/quotations/${item.entityId}`);
    } else if (item.entityType === 'PAYMENT') {
      navigate('/payments');
    } else if (item.entityType === 'EXPENSE') {
      navigate('/expenses');
    } else {
      navigate('/notifications');
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 transition-all cursor-pointer shadow-xs"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#121118] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121118] shadow-2xl z-50 overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white font-heading">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-gray-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto" />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  All caught up! No notifications.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    !item.isRead
                      ? 'bg-blue-50/50 dark:bg-blue-500/5 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {/* Icon */}
                  <div className="p-2 rounded-xl border border-gray-200/60 dark:border-white/10 bg-white dark:bg-white/5 shrink-0">
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-4 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-semibold truncate ${
                          !item.isRead
                            ? 'text-gray-900 dark:text-white font-bold'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 block pt-1">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Quick Delete on Hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-500 transition-opacity"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              <span>View All Notifications</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
