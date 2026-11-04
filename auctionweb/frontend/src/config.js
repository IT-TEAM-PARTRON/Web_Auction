/**
 * Tự động xác định Base URL cho Backend dựa theo URL trình duyệt (Dynamic Browser Location)
 * Hoặc sử dụng cấu hình từ biến môi trường VITE_API_BASE_URL (nếu được khai báo)
 */
export const getBaseUrl = () => {
  // 1. Ưu tiên sử dụng VITE_API_BASE_URL nếu được chỉ định trong .env
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "");
  }

  // 2. Tự động xác định theo IP/Domain hiện tại của trình duyệt
  if (typeof window !== "undefined" && window.location) {
    const { protocol, hostname, port } = window.location;

    // Nếu chạy qua Nginx Reverse Proxy hoặc cổng tiêu chuẩn (80/443 hoặc rỗng)
    if (port === "" || port === "80" || port === "443") {
      return `${protocol}//${hostname}`;
    }

    // Mặc định port backend khi chạy dev/nội bộ trực tiếp
    const backendPort = import.meta.env.VITE_BACKEND_PORT || "8000";
    return `${protocol}//${hostname}:${backendPort}`;
  }

  // Fallback mặc định cho môi trường không có window
  return "http://localhost:8000";
};

export const BASE_URL = getBaseUrl();

