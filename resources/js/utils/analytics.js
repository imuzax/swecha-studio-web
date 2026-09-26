import axios from 'axios';

export const trackEvent = (eventName, properties = {}) => {
    const currentUrl = window.location.href;
    
    // Defer analytics to prevent blocking navigation and static asset loading (especially on local PHP servers)
    setTimeout(async () => {
        try {
            await axios.post(route('analytics.track'), {
                event_name: eventName,
                url: currentUrl,
                properties
            });
        } catch (error) {
            // Fail silently so it doesn't break user experience
            console.error('Analytics tracking failed', error);
        }
    }, 1000); // 1s delay
};
