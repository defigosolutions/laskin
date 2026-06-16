import axios from 'axios'
import type { 
  Treatment, 
  Package, 
  Specialist, 
  Branch, 
  Category, 
  BeforeAfterCase,
  Review, 
  Booking 
} from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export const publicApiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

export const publicApi = {
  // Treatments
  getTreatments: async (params?: { categoryId?: string; search?: string }): Promise<Treatment[]> => {
    const res = await publicApiClient.get('/public/treatments', { params });
    return res.data;
  },
  getTreatment: async (slug: string): Promise<Treatment> => {
    const res = await publicApiClient.get(`/public/treatments/${slug}`);
    return res.data;
  },

  // Packages
  getPackages: async (params?: { search?: string }): Promise<Package[]> => {
    const res = await publicApiClient.get('/public/packages', { params });
    return res.data;
  },
  getPackage: async (slug: string): Promise<Package> => {
    const res = await publicApiClient.get(`/public/packages/${slug}`);
    return res.data;
  },

  // Products
  getProducts: async (): Promise<any[]> => {
    const res = await publicApiClient.get('/public/products');
    return res.data;
  },

  // Specialists
  getSpecialists: async (params?: { branchId?: string; search?: string }): Promise<Specialist[]> => {
    const res = await publicApiClient.get('/public/specialists', { params });
    return res.data;
  },

  // Before & After
  getBeforeAfterCases: async (params?: { treatmentId?: string; search?: string }): Promise<BeforeAfterCase[]> => {
    const res = await publicApiClient.get('/public/before-after', { params });
    return res.data;
  },

  // Reviews
  getReviews: async (params?: { branchId?: string }): Promise<Review[]> => {
    const res = await publicApiClient.get('/public/reviews', { params });
    return res.data;
  },

  // Settings
  getSiteSettings: async (): Promise<any> => {
    const res = await publicApiClient.get('/public/site-settings');
    return res.data;
  },

  // Branches
  getBranches: async (): Promise<Branch[]> => {
    const res = await publicApiClient.get('/public/branches');
    return res.data;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const res = await publicApiClient.get('/public/categories');
    return res.data;
  },



  // Submit Contact Inquiry
  submitInquiry: async (payload: { fullName: string; email: string; phone?: string; subject: string; message: string }): Promise<any> => {
    const res = await publicApiClient.post('/public/contact-inquiry', payload);
    return res.data;
  },

  // Subscribe Newsletter
  subscribeNewsletter: async (email: string): Promise<any> => {
    const res = await publicApiClient.post('/public/newsletter/subscribe', { email });
    return res.data;
  }
}
