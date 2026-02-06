export const CONSTANTS = {
    SYNC: {
        INTERVAL_MINUTES: 23 * 60, // 23 hours
    },
    API: {
        RATE_LIMIT: {
            CONTENT: { timeout: 30000, tries: 4, cutoff: 180000 },
            BACKGROUND: { timeout: 300000, tries: 4, cutoff: 30 * 60 * 1000 },
        },
    },
};
