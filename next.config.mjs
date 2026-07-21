/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracing: false,
  async redirects() {
    return [
      {
        source: "/connect/student/:token",
        destination: "/connect/student?token=:token",
        permanent: false,
      },
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
