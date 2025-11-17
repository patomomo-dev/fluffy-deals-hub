import { v4 as uuidv4 } from 'uuid';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
  category: string;
  discount: number;
  productIds: string[];
  active: boolean;
  image?: string;
  createdAt: string; // ISO
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
}

const STORAGE_KEY = 'petstore:promotions';
const CATEGORIES_KEY = 'petstore:categories';
const PRODUCTS_KEY = 'petstore:products';

class PromotionService {
  private readRaw(): Promotion[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const promotions = JSON.parse(data);
      // Normalize data: ensure id is string, productIds is string[]
      return promotions.map((p: any) => ({
        ...p,
        id: String(p.id),
        productIds: Array.isArray(p.productIds) 
          ? p.productIds.map((id: any) => String(id))
          : [],
        active: p.active !== undefined ? p.active : true,
      }));
    } catch (error) {
      console.error('Error reading promotions:', error);
      return [];
    }
  }

  private write(promotions: Promotion[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(promotions));
    } catch (error) {
      console.error('Error writing promotions:', error);
    }
  }

  getAll(): Promotion[] {
    return this.readRaw();
  }

  getActive(): Promotion[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const today = now.toISOString().slice(0, 10);
    
    return this.readRaw().filter(p => 
      p.active && 
      p.startDate <= today && 
      p.endDate >= today
    );
  }

  getScheduled(): Promotion[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const today = now.toISOString().slice(0, 10);
    
    return this.readRaw().filter(p => 
      p.active && 
      p.startDate > today
    );
  }

  getExpired(): Promotion[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const today = now.toISOString().slice(0, 10);
    
    return this.readRaw().filter(p => 
      p.active && 
      p.endDate < today
    );
  }

  getDeleted(): Promotion[] {
    return this.readRaw().filter(p => !p.active);
  }

  findById(id: string): Promotion | null {
    const normalized = String(id);
    return this.readRaw().find(p => String(p.id) === normalized) ?? null;
  }

  create(data: Omit<Promotion, 'id' | 'createdAt' | 'active'>): Promotion {
    const newPromotion: Promotion = {
      ...data,
      id: uuidv4(),
      active: true,
      createdAt: new Date().toISOString(),
    };
    
    const promotions = this.readRaw();
    promotions.push(newPromotion);
    this.write(promotions);
    
    return newPromotion;
  }

  update(id: string, changes: Partial<Promotion>): Promotion | null {
    const promotions = this.readRaw();
    const index = promotions.findIndex(p => String(p.id) === String(id));
    
    if (index === -1) return null;
    
    promotions[index] = { ...promotions[index], ...changes };
    this.write(promotions);
    
    return promotions[index];
  }

  remove(id: string): boolean {
    const result = this.update(id, { active: false });
    return result !== null;
  }

  restore(id: string): boolean {
    const result = this.update(id, { active: true });
    return result !== null;
  }

  purge(id: string): boolean {
    const promotions = this.readRaw();
    const filtered = promotions.filter(p => String(p.id) !== String(id));
    
    if (filtered.length === promotions.length) return false;
    
    this.write(filtered);
    return true;
  }

  // Category methods
  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(CATEGORIES_KEY);
      if (!data) {
        // Initialize with default categories
        const defaultCategories: Category[] = [
          { id: '1', name: 'Alimentos' },
          { id: '2', name: 'Accesorios' },
          { id: '3', name: 'Higiene' },
          { id: '4', name: 'Salud' },
          { id: '5', name: 'Juguetes' },
          { id: '6', name: 'Transporte' },
          { id: '7', name: 'Ropa' },
          { id: '8', name: 'Acuarios y Terrarios' },
          { id: '9', name: 'Entrenamiento' },
          { id: '10', name: 'Ganadería' },
        ];
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
        return defaultCategories;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading categories:', error);
      return [];
    }
  }

  // Product methods
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(PRODUCTS_KEY);
      if (!data) {
        // Initialize with mock products
        const mockProducts: Product[] = [];
        const categories = this.getCategories();
        
        categories.forEach(cat => {
          for (let i = 1; i <= 10; i++) {
            mockProducts.push({
              id: `${cat.id}-${i}`,
              name: `Producto ${i} de ${cat.name}`,
              description: `Descripción del producto ${i}`,
              price: Math.floor(Math.random() * 100) + 10,
              image: '/placeholder.svg',
              categoryId: cat.id,
            });
          }
        });
        
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mockProducts));
        return mockProducts;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading products:', error);
      return [];
    }
  }

  getProductsByCategory(categoryId: string): Product[] {
    return this.getProducts().filter(p => p.categoryId === categoryId);
  }
}

export const promotionService = new PromotionService();
