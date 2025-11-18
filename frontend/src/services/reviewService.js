import axios from 'axios';

const API_URL = 'http://localhost:5234/api';

class ReviewService {
  constructor() {
    this.api = axios.create({ baseURL: API_URL });

    this.api.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  async getAll() {
    const response = await this.api.get('/BookReview');
    return response.data;
  }

  async getById(id) {
    const response = await this.api.get(`/BookReview/${id}`);
    return response.data;
  }

  async getByBook(bookId) {
    const response = await this.api.get(`/BookReview/book/${bookId}`);
    return response.data;
  }

  async getByUser(userId) {
    const response = await this.api.get(`/BookReview/user/${userId}`);
    return response.data;
  }

  async create(review) {
    const response = await this.api.post('/BookReview', review);
    return response.data;
  }

  async update(id, review) {
    const response = await this.api.put(`/BookReview/${id}`, review);
    return response.data;
  }

  async delete(id) {
    const response = await this.api.delete(`/BookReview/${id}`);
    return response.data;
  }

  async getAverageRating(bookId) {
    const response = await this.api.get(`/BookReview/book/${bookId}/average-rating`);
    return response.data;
  }

  async getCount(bookId) {
    const response = await this.api.get(`/BookReview/book/${bookId}/count`);
    return response.data;
  }

  async hasUserReviewed(userId, bookId) {
    const response = await this.api.get(`/BookReview/user/${userId}/book/${bookId}/has-reviewed`);
    return response.data;
  }
}

const reviewService = new ReviewService();
export default reviewService;
