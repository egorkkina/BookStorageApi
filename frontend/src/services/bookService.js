import axios from 'axios';

const API_URL = 'http://localhost:5234/api';

class BookService {
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
  }

  async getAllBooks() {
    const response = await this.api.get('/Books');
    return response.data;
  }

  async getBookById(id) {
    const response = await this.api.get(`/Books/${id}`);
    return response.data;
  }

  async getBooksByAuthor(author) {
    const response = await this.api.get(`/Books/author/${encodeURIComponent(author)}`);
    return response.data;
  }

  async createBook(bookData) {
    const response = await this.api.post('/Books', bookData);
    return response.data;
  }

  async updateBook(id, bookData) {
    const response = await this.api.put(`/Books/${id}`, bookData);
    return response.data;
  }

  async deleteBook(id) {
    const response = await this.api.delete(`/Books/${id}`);
    return response.data;
  }
}

const bookService = new BookService();
export default bookService;