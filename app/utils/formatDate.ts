import { format, formatDistanceToNow } from "date-fns";

function formatPostedDate(date: Date) {
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    // If the date is more than a day ago, show the full date
    if (now.getTime() - date.getTime() > oneDayInMs) {
        return `Posted on ${format(date, "MMMM d")}`;
    } else {
        // If less than a day, show the time ago format
        return `Posted ${formatDistanceToNow(date, { addSuffix: true })}`;
    }
}

export { formatPostedDate }