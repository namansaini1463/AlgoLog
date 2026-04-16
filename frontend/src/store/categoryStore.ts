import { create } from 'zustand';
import { categoriesApi, type UserCategory } from '../api/categories';

interface CategoryState {
  // Currently selected category filter ('ALL' or a category name string)
  category: string;
  setCategory: (category: string) => void;

  // User's custom categories fetched from API
  categories: UserCategory[];
  isLoaded: boolean;
  fetchCategories: () => Promise<void>;

  // Helper to get color for a category name
  getCategoryColor: (name: string) => string;
}

const getInitialCategory = (): string => {
  return localStorage.getItem('category') || 'ALL';
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  category: getInitialCategory(),
  setCategory: (category) => {
    localStorage.setItem('category', category);
    set({ category });
  },

  categories: [],
  isLoaded: false,

  fetchCategories: async () => {
    try {
      const res = await categoriesApi.list();
      const categories = res.data;
      set({ categories, isLoaded: true });

      // If the stored category no longer exists in user's list, reset to ALL
      const stored = get().category;
      if (stored !== 'ALL' && !categories.some((c) => c.name === stored)) {
        localStorage.setItem('category', 'ALL');
        set({ category: 'ALL' });
      }
    } catch {
      // If not authenticated yet, silently fail
      set({ isLoaded: false });
    }
  },

  getCategoryColor: (name) => {
    const cat = get().categories.find((c) => c.name === name);
    return cat?.colorHex || '#6B7280'; // default gray
  },
}));
