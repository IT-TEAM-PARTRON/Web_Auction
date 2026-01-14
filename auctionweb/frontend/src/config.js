// Hàm check xem người dùng có đang trong mạng LAN không
const isLanNetwork = () => {
  const hostname = window.location.hostname;
  if (
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.") ||
    hostname.startsWith("localhost")
  ) {
    return true;
  }
  return false;
};

export const BASE_URL = isLanNetwork()
  ? import.meta.env.VITE_BASE_URL_LAN
  : import.meta.env.VITE_BASE_URL_PUBLIC;
