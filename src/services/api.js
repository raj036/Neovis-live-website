//import { getToken } from "./../../utils/helper";
import Axios from "axios";

export const AXIOS_INSTANCE = Axios.create({
  // "http://localhost:8000"
  // "https://vinspect-server-dev.herokuapp.com"
  // "https://shark-app-6wiyn.ondigitalocean.app"
  // baseURL: "https://api.neovis.io/api/v1",
  baseURL: "https://shark-app-6wiyn.ondigitalocean.app/api/v1",
});

export const customInstance = (config) => {
  const token = ""; //getToken();
  AXIOS_INSTANCE.interceptors.request.use((_config) => {
    _config.headers.Authorization = `Bearer ${token}`;
    return _config;
  });
  const promise = AXIOS_INSTANCE({ ...config }).then(({ data }) => data);

  return promise;
};

export default customInstance;
