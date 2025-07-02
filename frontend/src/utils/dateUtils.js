/**
 * Date utility functions for consistent IST (Indian Standard Time) formatting
 * Simplified approach - manually adds 5:30 hours to UTC times
 */

/**
 * Format date to IST with full date and time - for chat timestamps
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date and time string in IST (e.g., "Jan 15, 2024, 12:57 PM")
 */
export const formatDateIST = (dateInput) => {
  if (!dateInput) return '';
  
  // Create date object from input
  const date = new Date(dateInput);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  // Manually add 5:30 hours to convert UTC to IST
  const istTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  
  // Format with both date and time
  return istTime.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date to IST with full date and time
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string in IST
 */
export const formatFullDateIST = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  const date = new Date(dateInput);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  // Manually add 5:30 hours to convert UTC to IST
  const istTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  
  return istTime.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date to IST with only date (no time)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string in IST
 */
export const formatDateOnlyIST = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  const date = new Date(dateInput);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  // Manually add 5:30 hours to convert UTC to IST
  const istTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  
  return istTime.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format time to IST with only time (no date) - for compact displays
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted time string in IST (e.g., "12:57 PM")
 */
export const formatTimeOnlyIST = (dateInput) => {
  if (!dateInput) return '';
  
  // Create date object from input
  const date = new Date(dateInput);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Time';
  
  // Manually add 5:30 hours to convert UTC to IST
  const istTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  
  // Format as time only
  return istTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get current date and time in IST
 * @returns {Date} Current date in IST
 */
export const getCurrentDateIST = () => {
  const now = new Date();
  return new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
};
