"use client";

import Link from "next/link";
import { useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  actionLabel?: string;
  actionHref?: string;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n-1",
    title: "New exploration site review needed",
    message: "Field Officer J. Perera submitted 'Sigiriya East Ridge' for validation.",
    time: "2 hours ago",
    unread: true,
    actionLabel: "Review site",
    actionHref: "/admin/dashboard/decisions",
  },
  {
    id: "n-2",
    title: "Vulnerability analysis report generated",
    message: "Analyst K. Samarasinghe generated the Q2 Archaeological Risk Report.",
    time: "1 day ago",
    unread: true,
    actionLabel: "View reports",
    actionHref: "/admin/dashboard/reports",
  },
  {
    id: "n-3",
    title: "New user account request",
    message: "Field Officer account registered for A. Silva is pending activation.",
    time: "2 days ago",
    unread: false,
    actionLabel: "Manage users",
    actionHref: "/admin/dashboard/users",
  },
  {
    id: "n-4",
    title: "System database backup completed",
    message: "Exploration coordinate database backed up successfully. Size: 45 MB.",
    time: "3 days ago",
    unread: false,
  },
];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => n.unread).length;
  const filteredList = notifications.filter((n) => filter === "all" || n.unread);

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function toggleRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  }

  function clearNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">Notifications</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/logout"
            className="text-[13px] font-medium text-[#5B6472] transition hover:text-[#BB892C]"
          >
            Log out
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DEDBD1] bg-[#F0E6C8] font-serif text-[12px] text-[#8F6A21]">
            NF
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-8 py-7">
        <div className="mx-auto max-w-[760px]">
          {/* Controls */}
          <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-3.5">
            <div className="flex gap-4 text-[13px]">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`pb-3.5 font-medium transition ${
                  filter === "all"
                    ? "border-b-2 border-[#BB892C] text-[#3A2A12]"
                    : "text-[#8A8478] hover:text-[#3A2A12]"
                }`}
              >
                All notifications ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`pb-3.5 font-medium transition ${
                  filter === "unread"
                    ? "border-b-2 border-[#BB892C] text-[#3A2A12]"
                    : "text-[#8A8478] hover:text-[#3A2A12]"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[12.5px] font-medium text-[#BB892C] transition hover:text-[#8F6A21] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="mt-4 space-y-3">
            {filteredList.length === 0 ? (
              <div className="rounded-[8px] border border-[#DEDBD1] bg-white py-12 text-center text-[#8A8D86]">
                <BellIcon className="mx-auto h-8 w-8 text-[#A6A199]" />
                <p className="mt-2 text-[14px]">No notifications found.</p>
              </div>
            ) : (
              filteredList.map((n) => (
                <div
                  key={n.id}
                  className={`group relative flex items-start gap-4 rounded-[8px] border border-[#DEDBD1] bg-white p-4 transition hover:border-[#BB892C]/20 hover:shadow-xs ${
                    n.unread ? "border-l-4 border-l-[#BB892C]" : ""
                  }`}
                >
                  {/* Icon */}
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FAF6EB] text-[#BB892C]">
                    <ActivityIcon />
                  </div>

                  {/* Body */}
                  <div className="flex-1 pr-12">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13.5px] font-semibold text-[#3A2A12]">{n.title}</h3>
                      {n.unread && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#BB892C]" aria-hidden="true" />
                      )}
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-[#5B6472]">{n.message}</p>
                    <span className="mt-2 block text-[11px] text-[#8A8D86]">{n.time}</span>

                    {n.actionLabel && n.actionHref && (
                      <Link
                        href={n.actionHref}
                        className="mt-3.5 inline-flex items-center gap-1 text-[12px] font-semibold text-[#BB892C] transition hover:text-[#8F6A21] hover:underline"
                      >
                        {n.actionLabel} &rarr;
                      </Link>
                    )}
                  </div>

                  {/* Inline Actions */}
                  <div className="absolute right-4 top-4 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => toggleRead(n.id)}
                      title={n.unread ? "Mark as read" : "Mark as unread"}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-[#DEDBD1] bg-white text-[#5B6472] hover:border-[#BB892C]/40 hover:text-[#BB892C] transition"
                    >
                      {n.unread ? <CheckIcon /> : <OpenMailIcon />}
                    </button>
                    <button
                      type="button"
                      onClick={() => clearNotification(n.id)}
                      title="Dismiss"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-[#DEDBD1] bg-white text-[#5B6472] hover:border-[#B03A2E]/40 hover:text-[#B03A2E] transition"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function OpenMailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.2 8.4c.5.3.8.8.8 1.4v8.4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.8c0-.6.3-1.1.8-1.4l8-4.8a2 2 0 0 1 2.4 0l8 4.8z" />
      <path d="M2 10l10 6 10-6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
