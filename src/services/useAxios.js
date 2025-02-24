import axios from "axios";
import { getToken } from "../utils/helper";

const getInstance = (token) => {
  // "http://localhost:8000"
  // "https://vinspect-server-dev.herokuapp.com"
  // "https://shark-app-6wiyn.ondigitalocean.app"
  const axiosApiInstance = axios.create({
    // baseURL: "http://localhost:8000/api/v1/",
    // baseURL: "https://api.neovis.io/api/v1/",
    baseURL: "https://shark-app-6wiyn.ondigitalocean.app/api/v1/",
  });

  axiosApiInstance.interceptors.request.use(
    (config) => {
      if (token && !config.url.includes("login")) {
        config.headers.common = {
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },
    (error) => {
      Promise.reject(error);
    }
  );

  return axiosApiInstance;
};

export default function useAxios() {
  const token = getToken();
  return getInstance(token);
}


// subhajit.paul@mindnerves.com
// 123456
// testOwner6@gmail.com
