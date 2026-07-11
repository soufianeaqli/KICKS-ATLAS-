import { create } from 'zustand';
import axios from 'axios';

const useProductStore = create((set) => ({
  products: [],
  product: null,
  loading: false,
  error: null,
  page: 1,
  pages: 1,

  fetchProducts: async (team = '', params = {}) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams({ team, ...params }).toString();
      const { data } = await axios.get(`http://localhost:5000/api/products?${query}`);
      set({ products: data.products, page: data.page, pages: data.pages, loading: false });
    } catch (error) {
      set({ 
        error: error.response && error.response.data.message ? error.response.data.message : error.message, 
        loading: false 
      });
    }
  },

  fetchProductById: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
      set({ product: data, loading: false });
    } catch (error) {
      set({ 
        error: error.response && error.response.data.message ? error.response.data.message : error.message, 
        loading: false 
      });
    }
  }
}));

export default useProductStore;
