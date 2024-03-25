// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ["uploadthing.com", "utfs.io"],
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "uploadthing.com" }, { hostname: "utfs.io" }],
  },
};

export default nextConfig;
