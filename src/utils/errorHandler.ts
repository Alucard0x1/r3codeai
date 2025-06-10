import { toast } from 'react-toastify';

/**
 * Handles errors by logging them and displaying a user-friendly toast notification.
 *
 * @param error - The error object to be handled.
 * @param userMessage - Optional user-friendly message to display. If not provided, a generic message is shown.
 */
const handleError = (error: any, userMessage?: string): void => {
  // Log the full error to the console for debugging
  console.error("An error occurred:", error);

  // Prepare the message for the toast notification
  const messageToDisplay = userMessage || "An unexpected error occurred. Please try again.";

  // Display the toast notification
  toast.error(messageToDisplay);
};

export default handleError;
