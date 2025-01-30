import { initialize } from 'unleash-client';

const unleashConfig = {
    url: process.env.REACT_APP_UNLEASH_URL || 'https://your-unleash-instance.com/api/',
    appName: 'react-encrypt',
    environment: process.env.NODE_ENV,
    customHeaders: {
        Authorization: process.env.REACT_APP_UNLEASH_API_TOKEN,
    },
};

// Initialize the Unleash client
const unleash = initialize(unleashConfig);

// Feature flag names
export const FEATURE_FLAGS = {
    ENABLE_PRODUCTION: 'enable-production-environment',
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (featureName, context = {}) => {
    return unleash.isEnabled(featureName, context);
};

export default unleash; 