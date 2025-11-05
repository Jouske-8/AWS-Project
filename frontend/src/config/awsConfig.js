import { Amplify } from 'aws-amplify';

// --- AWS Amplify Configuration ---
// IMPORTANT: Replace with your actual Cognito User Pool details.
// You can get these from the AWS Cognito console after deploying your infrastructure.
export const cognitoConfig = {
    Auth: {
        Cognito: {
            region: 'ap-south-1', // Example: 'us-east-1'
            userPoolId: 'ap-south-1_puwv3fL69', // Your User Pool ID
            userPoolClientId: '6t6rv0ua7a026tpg524redm79f', // Your User Pool Web Client ID
        }
    }
};

Amplify.configure(cognitoConfig);
