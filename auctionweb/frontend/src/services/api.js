import { axiosWithToken, axiosDefault } from './axiosClient';




export const create = async (resource, data, isAuth, params = {}) => {
    if (isAuth) {
        return await axiosWithToken.post(`/${resource}`, data, { params });
    } else {
        return await axiosDefault.post(`/${resource}`, data, { params });
    }
};


export const getAll = async (resource, isAuth, params = {}) => {
    if (isAuth) {
        return await axiosWithToken.get(`/${resource}`, { params });
    } else {
        return await axiosDefault.get(`/${resource}`, { params });
    }
};


export const getOne = async (resource, id, isAuth, params = {}) => {
    if (isAuth) {
        return await axiosWithToken.get(`/${resource}/${id}`, { params });
    } else {
        return await axiosDefault.get(`/${resource}/${id}`, { params });
    }
};


export const update = async (resource, id, data, isAuth, params = {}) => {
    if (isAuth) {
        return await axiosWithToken.put(`/${resource}/${id}`, data, { params });
    } else {
        return await axiosDefault.put(`/${resource}/${id}`, data, { params });
    }
};

export const updateSatus = async (resource, id, data, isAuth, params = {}) => {
    if (isAuth) {
        return await axiosWithToken.patch(`/${resource}/${id}/status`, data, { params });
    } else {
        return await axiosDefault.patch(`/${resource}/${id}/status`, data, { params });
    }
};


export const deleteOne = async (resource, id, isAuth) => {
    if (isAuth) {
        return await axiosWithToken.delete(`/${resource}/${id}`);
    } else {
        return await axiosDefault.delete(`/${resource}/${id}`);
    }
};

export const forgotPassword = async (email) => {
    return await axiosDefault.post('/forgot-password', { email });
};

export const resetPassword = async (token, newPassword) => {
    return await axiosDefault.post('/reset-password', {
        token,
        new_password: newPassword
    });
};

export const verifyResetToken = async (token) => {
    return await axiosDefault.post('/verify-reset-token', { token });
};

export const updateInvalidateBid = async (resource, id, isAuth, reason) => {
    const config = {
        params: { reason }
    };

    if (isAuth) {
        return axiosWithToken.put(`/${resource}/${id}/void`, null, config);
    } else {
        return axiosDefault.put(`/${resource}/${id}/void`, null, config);
    }
};