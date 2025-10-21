// --- AWS Amplify Configuration ---
// IMPORTANT: Replace with your actual Cognito User Pool details.
// You can get these from the AWS Cognito console after deploying your infrastructure.
export const cognitoConfig = {
    Auth: {
        region: 'ap-south-1', // Example: 'us-east-1'
        userPoolId: 'ap-south-1_XXXXXXXXX', // Your User Pool ID
        userPoolWebClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Your User Pool Web Client ID
    }
};

// Uncomment the line below when you have your actual Cognito details
// Amplify.configure(cognitoConfig);
