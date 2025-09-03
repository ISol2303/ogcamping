/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
<<<<<<< HEAD
        pathname: '/uploads/gears/**',
=======
        pathname: '/**',
>>>>>>> 4b112d9 (Add or update frontend & backend code)
      },
    ],
  },
}

module.exports = nextConfig
