// import { CorsOptions } from "cors";

// export const corsConfig: CorsOptions = {
//   origin: (origin, callback) => {
//     const whiteList = [process.env.FRONTEND_URL];
//     if (process.argv[2] === "--api") {
//       whiteList.push(undefined);
//     }
//     if (whiteList.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Error de CORS"));
//     }
//   },
// };

import { CorsOptions } from "cors";

// export const corsConfig: CorsOptions = {
//   origin: (origin, callback) => {
//     const whiteList = [process.env.FRONTEND_URL];
//     if (process.argv[2] === "--api") {
//       whiteList.push(undefined);
//     }
//     console.log("Origin:", origin);
//     console.log("WhiteList:", whiteList);

//     if (whiteList.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Error de CORS"));
//     }
//   },
// };

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const whiteList = [process.env.FRONTEND_URL];
    if (process.argv[2] === "--api") {
      whiteList.push(undefined); // Permitir solicitudes sin origen (por ejemplo, desde Postman)
    }
    if (whiteList.includes(origin) || !origin) {
      // Permitir solicitudes sin origen
      callback(null, true);
    } else {
      callback(new Error("Error de CORS"));
    }
  },
};
