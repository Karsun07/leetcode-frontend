import axios from "axios"

const axiosClient =  axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// While a refresh call is in-flight, queue up any other requests that also
// got a 401 so we don't fire /user/refresh multiple times in parallel.
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = () => {
    refreshSubscribers.forEach((cb) => cb());
    refreshSubscribers = [];
};

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { response, config: originalRequest } = error;

        // Only handle expired access tokens (401), only once per request,
        // and never for the auth endpoints themselves (avoids infinite loops).
        const isAuthRoute =
            originalRequest?.url?.includes('/user/login') ||
            originalRequest?.url?.includes('/user/register') ||
            originalRequest?.url?.includes('/user/refresh');

        if (response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    // refreshToken cookie is sent automatically (withCredentials: true)
                    await axiosClient.post('/user/refresh');
                    isRefreshing = false;
                    onRefreshed();
                } catch (refreshError) {
                    isRefreshing = false;
                    refreshSubscribers = [];
                    // refresh token is invalid/expired too — real logout needed
                    return Promise.reject(refreshError);
                }
            }

            // wait for the in-flight refresh to finish, then retry this request
            return new Promise((resolve) => {
                subscribeTokenRefresh(() => {
                    resolve(axiosClient(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);

export default axiosClient;