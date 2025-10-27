// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [
//     react({
//       include: "**/*.{jsx,js}",
//     }),
//   ],
//   // Use the more robust object syntax for the proxy
//   server: {
//     proxy: {
//       "/api": {
//         // target: "http://localhost:3001",
//         target: "https://triact-final.vercel.app",
//         changeOrigin: true, // This is often necessary
//         secure: false,
//       },
//     },
//   },
// });


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,js}",
    }),
  ],

  // Proxy only needed in development
  server: {
    proxy: isProduction
      ? {}
      : {
          "/api": {
            target: "http://localhost:3001",
            changeOrigin: true,
            secure: false,
          },
        },
  },

  // Define the API base for both environments
  define: {
    __API_BASE__: JSON.stringify(
      isProduction
        ? "https://triact-final.vercel.app" // backend deployed on Vercel
        : "" // let Vite proxy handle it in dev
    ),
  },
});



