import { Amplify } from 'aws-amplify';

// --- AWS Amplify Configuration ---
// IMPORTANT: Replace with your actual Cognito User Pool details.
// You can get these from the AWS Cognito console after deploying your infrastructure.
export const cognitoConfig = {
    Auth: {
        Cognito: {
            region: 'eu-north-1', // Example: 'us-east-1'
            userPoolId: 'eu-north-1_RUm7RLoxp', // Your User Pool ID
            userPoolClientId: '2u6pcj8p8op4l4r2ngh8s6puvq', // Your User Pool Web Client ID
        }
    }
};

Amplify.configure(cognitoConfig);
