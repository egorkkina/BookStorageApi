import axios from 'axios';

const API_URL = 'http://localhost:5234/api';

class UserService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async getMyProfile() {
    const response = await this.api.get('/User/profile');
    return response.data;
  }

  async updateProfile(userId, userData) {
    const response = await this.api.put(`/User/${userId}`, userData);
    return response.data;
  }

  async getUserByEmail(email) {
    const response = await this.api.get(`/User/email/${email}`);
    return response.data;
  }

  async deleteUser(userId) {
    const response = await this.api.delete(`/User/${userId}`);
    return response.data;
  }

  async uploadAvatar(userId, avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const response = await this.api.post(`/User/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

const userService = new UserService();
export default userService;