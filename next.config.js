/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  images: {
    unoptimized: true,
  },

  env: {
    AWS_REGION: process.env.AWS_REGION,
    NEXT_PUBLIC_AWS_REGION: process.env.AWS_REGION,
    NEXT_PUBLIC_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
    NEXT_PUBLIC_USER_POOL_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
    NEXT_PUBLIC_S3_BUCKET: process.env.S3_BUCKET_NAME,
  },
};

module.exports = nextConfig;