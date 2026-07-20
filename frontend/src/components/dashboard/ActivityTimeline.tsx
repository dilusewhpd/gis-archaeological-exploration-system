export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  status?: "completed" | "pending" | "alert" | "info";
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {/* Vertical line connecting nodes */}
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-[#DEDBD1]"
                  aria-hidden="true"
                />
              ) : null}

              <div className="relative flex space-x-3 sm:space-x-4">
                {/* Status Dot */}
                <div>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white ${getStatusColor(
                      activity.status
                    )}`}
                  >
                    {getStatusIcon(activity.status)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <div>
                      <p className="text-[13px] font-medium text-[#3A2A12]">
                        {activity.title}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#8A8478] leading-relaxed">
                        {activity.detail}
                      </p>
                    </div>
                    <div className="text-right text-[11px] whitespace-nowrap text-[#A6A199] sm:pl-3 font-medium">
                      <time dateTime={activity.timestamp}>{activity.timestamp}</time>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getStatusColor(status?: ActivityItem["status"]) {
  switch (status) {
    case "completed":
      return "bg-[#EAF3EA] text-[#2C6B33]";
    case "pending":
      return "bg-[#FBF0EB] text-[#9A5A2E]";
    case "alert":
      return "bg-[#FBEBEA] text-[#B03A2E]";
    case "info":
    default:
      return "bg-[#F4F3EF] text-[#16283F]";
  }
}

function getStatusIcon(status?: ActivityItem["status"]) {
  switch (status) {
    case "completed":
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "pending":
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "alert":
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case "info":
    default:
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}
