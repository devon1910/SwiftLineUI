
import API from './APIService';

class LoadingService {
  constructor() {
    this.pendingRequests = 0;
    this.listeners = [];
    this.initializeInterceptors();
  }

  initializeInterceptors() {
    API.interceptors.request.use(config => {
      this.pendingRequests++;
      this.notifyListeners();
      return config;
    });

    API.interceptors.response.use(
      response => {
        this.pendingRequests--;
        this.notifyListeners();
        return response;
      },
      error => {
        this.pendingRequests--;
        this.notifyListeners();
        return Promise.reject(error);
      }
    );
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  get isLoading() {
    return this.pendingRequests > 0;
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.isLoading));
  }
}

export const loadingService = new LoadingService();