// Common utility functions
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
    });
};

export const formatDuration = (duration) => {
    return duration.replace('PT', '')
        .replace('H', 'h ')
        .replace('M', 'm')
        .toLowerCase();
}; 