
import axios from 'axios';

const axiosWithToken = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,
});

axiosWithToken.interceptors.request.use(
    (config) => {
    const token = 
    JSON.parse(localStorage.getItem('user') || "null")?.access_token ||
    JSON.parse(sessionStorage.getItem('user') || "null")?.access_token

    const lang = sessionStorage.getItem('lang') || 'en';
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    config.headers['Accept-Language'] = lang;
    return config;
 },
    (error) => {
        return Promise.reject(error);
    }
);


const axiosDefault = axios.create({
  baseURL: '/api/v1',
  timeout: 5000,
});

axiosDefault.interceptors.request.use(
  (config) => {
    const lang = sessionStorage.getItem('lang') || 'en';
    config.headers['Accept-Language'] = lang;
    return config;
  },
  (error) => Promise.reject(error)
);


export { axiosWithToken, axiosDefault };

export default axiosWithToken
