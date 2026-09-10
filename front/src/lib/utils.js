export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatLastSeen(dateString) {
  if (!dateString) return "Offline";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Last seen just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`;

  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return `Last seen today at ${timeString}`;

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Last seen yesterday at ${timeString}`;
  }

  return `Last seen ${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${timeString}`;
}
