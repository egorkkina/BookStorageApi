import axios from 'axios';

const API_URL = 'http://localhost:5234/api';

class ReadingListService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
    });

    // Добавляем токен в заголовки
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Получить все списки (Admin)
  async getAll() {
    try {
      const response = await this.api.get('/ReadingList');
      return response.data;
    } catch (err) {
      console.error('Ошибка при получении всех списков:', err);
      throw err;
    }
  }

  // Получить список по ID
  async getById(id) {
    try {
      const response = await this.api.get(`/ReadingList/${id}`);
      return response.data; // серверный id всегда
    } catch (err) {
      console.error(`Ошибка при получении списка с ID ${id}:`, err);
      throw err;
    }
  }

  // Получить списки по пользователю
  async getByUser(userId) {
    try {
      const response = await this.api.get(`/ReadingList/user/${userId}`);
      return response.data.map(list => ({
        id: list.id, // используем ID из сервера
        readingListName: list.readingListName,
        readingListDescription: list.readingListDescription,
        isPublic: list.isPublic,
      }));
    } catch (err) {
      console.error(`Ошибка при получении списков пользователя ${userId}:`, err);
      throw err;
    }
  }

  async getAllPublicLists() {
    try {
      const allLists = await this.getAll();
      return allLists.filter(list => list.isPublic);
    } catch (err) {
      console.error('Ошибка при получении публичных списков:', err);
      throw err;
    }
  }



  // Создать список
  async create(listData) {
    try {
      const response = await this.api.post('/ReadingList', listData);
      return {
        id: response.data.id, // используем серверный ID
        readingListName: response.data.readingListName,
        readingListDescription: response.data.readingListDescription,
        isPublic: response.data.isPublic,
      };
    } catch (err) {
      console.error('Ошибка при создании списка:', err);
      throw err;
    }
  }

  // Обновить список
  async update(id, listData) {
    try {
      const response = await this.api.put(`/ReadingList/${id}`, listData);
      return response.data;
    } catch (err) {
      console.error(`Ошибка при обновлении списка ${id}:`, err);
      throw err;
    }
  }

  // Удалить список
  async delete(id) {
    try {
      const response = await this.api.delete(`/ReadingList/${id}`);
      return response.data;
    } catch (err) {
      console.error(`Ошибка при удалении списка ${id}:`, err);
      throw err;
    }
  }

  // Добавить книгу
  async addBook(listId, bookId) {
    try {
      const response = await this.api.post(`/ReadingList/${listId}/books/${bookId}`);
      return response.data;
    } catch (err) {
      console.error(`Ошибка при добавлении книги ${bookId} в список ${listId}:`, err);
      throw err;
    }
  }

  // Удалить книгу
  async removeBook(listId, bookId) {
    try {
      const response = await this.api.delete(`/ReadingList/${listId}/books/${bookId}`);
      return response.data;
    } catch (err) {
      console.error(`Ошибка при удалении книги ${bookId} из списка ${listId}:`, err);
      throw err;
    }
  }

  // Получить книги в списке
  async getBooks(listId) {
    try {
      const response = await this.api.get(`/ReadingList/${listId}/books`);
      return response.data;
    } catch (err) {
      console.error(`Ошибка при получении книг списка ${listId}:`, err);
      throw err;
    }
  }

  async getCount(listId) {
    try {
      const response = await this.api.get(`/ReadingList/${listId}/books/count`);
      return response.data;
    } catch (err) {
      console.error(`Ошибка при получении количества книг списка ${listId}:`, err);
      throw err;
    }
  }

  async exists(listId, bookId) {
    try {
      const response = await this.api.get(`/ReadingList/${listId}/books/${bookId}/exists`);
      return response.data;
    } catch (err) {
      console.error(`Ошибка при проверке книги ${bookId} в списке ${listId}:`, err);
      throw err;
    }
  }
}

const readingListService = new ReadingListService();
export default readingListService;
