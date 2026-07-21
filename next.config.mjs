/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracing: false,
  async redirects() {
    return [
      {
        source: "/join/teacher/:inviteCode",
        destination: "/signup?type=teacher&invite=:inviteCode",
        permanent: false,
      },
      {
        source: "/join/:inviteCode",
        destination: "/signup?invite=:inviteCode",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
