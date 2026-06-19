// AWS Configuration
export const awsConfig = {
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

// DynamoDB Table Names
export const tables = {
  products: process.env.DYNAMODB_PRODUCTS_TABLE || 'dealinstinct-products',
  inventory: process.env.DYNAMODB_INVENTORY_TABLE || 'dealinstinct-inventory',
  orders: process.env.DYNAMODB_ORDERS_TABLE || 'dealinstinct-orders',
  users: process.env.DYNAMODB_USERS_TABLE || 'dealinstinct-users',
  categories: process.env.DYNAMODB_CATEGORIES_TABLE || 'dealinstinct-categories',
  cart: process.env.DYNAMODB_CART_TABLE || 'dealinstinct-cart',
};

// Cognito Configuration
export const cognitoConfig = {
  userPoolId: process.env.COGNITO_USER_POOL_ID || '',
  clientId: process.env.COGNITO_CLIENT_ID || '',
  clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
};

// S3 Configuration
export const s3Config = {
  bucketName: process.env.S3_BUCKET_NAME || 'dealinstinct-media',
  region: process.env.S3_BUCKET_REGION || 'eu-west-1',
};

// Stripe Configuration
export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};
