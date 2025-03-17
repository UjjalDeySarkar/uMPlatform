/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'https://ycjmshkgfwiaulnshipl.supabase.co', // Your Supabase storage domain
        // 'avatars.githubusercontent.com', // For GitHub avatars
        // 'lh3.googleusercontent.com', // For Google avatars
      ],
    },
  };
  
  module.exports = nextConfig;
  