import { gql } from '@apollo/client';
// --------------- BASIC PROMOTION QUERIES/MUTATIONS ---------------
export interface Promotion {
  promotionId: string;
  promotionName: string;
  description: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
  status: {
    statusId: string;
    statusName: string;
  };
  user: {
    userId: number;
    userName: string;
    email: string;
  };
  category: {
    categoryId: number;
    categoryName: string;
    description: string;
  };
  products: Array<{
    productId: number;
    productName: string;
    basePrice: number;
    sku: string;
  }>;
}

export interface PromotionsResponse {
  promotions: Promotion[];
}

export interface CreatePromotionInput {
  promotionName: string;
  description?: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
  statusId: string;
  userId?: number;
  categoryId?: number;
}

export interface CreatePromotionResponse {
  createPromotion: Promotion;
}

export interface UpdatePromotionInput {
  promotionName: string;
  description: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
  categoryId: number;
  statusId: string;
  userId?: number;
}

export interface UpdatePromotionResponse {
  updatePromotion: Promotion;
}

export const GET_PROMOTIONS = gql`
  query Promotions {
    promotions {
      promotionId
      promotionName
      description
      startDate
      endDate
      discountPercentage
      status {
        statusId
        statusName
      }
      user {
        userId
        userName
        email
      }
      category {
        categoryId
        categoryName
        description
      }
      products {
        productId
        productName
        basePrice
        sku
      }
    }
  }
`;

export const CREATE_PROMOTION = gql`
  mutation CreatePromotion($input: PromotionInput!) {
    createPromotion(input: $input) {
      promotionId
      promotionName
      description
      startDate
      endDate
      discountPercentage
      status {
        statusId
        statusName
      }
      user {
        userId
        userName
        email
      }
      category {
        categoryId
        categoryName
        description
      }
      products {
        productId
        productName
        basePrice
        sku
      }
    }
  }
`;

export const UPDATE_PROMOTION = gql`
  mutation UpdatePromotion($id: ID!, $input: PromotionInput!) {
    updatePromotion(id: $id, input: $input) {
      promotionId
      promotionName
      description
      startDate
      endDate
      discountPercentage
      status {
        statusId
        statusName
      }
      user {
        userId
        userName
        email
      }
      products {
        productId
        productName
        basePrice
        sku
      }
      category {
        categoryId
        categoryName
        description
      }
    }
  }
`;

export const DELETE_PROMOTION = gql`
  mutation DeletePromotion($id: ID!, $userId: ID) {
    deletePromotion(id: $id, userId: $userId)
  }
`;

export interface DeletePromotionResponse {
  deletePromotion: boolean;
}

export const RESTORE_PROMOTION = gql`
  mutation RestorePromotion($id: ID!, $userId: ID!) {
    restorePromotion(id: $id, userId: $userId)
  }
`;

export interface RestorePromotionResponse {
  restorePromotion: boolean;
}

export const PERMANENTLY_DELETE_PROMOTION = gql`
  mutation PermanentDeletePromotion($id: ID!, $userId: ID!) {
    permanentDeletePromotion(id: $id, userId: $userId)
  }
`;

export interface PermanentDeletePromotionResponse {
  permanentDeletePromotion: boolean;
}

// --------------- CATEGORY AND PRODUCT QUERIES/MUTATIONS ---------------
export const GET_CATEGORIES = gql`
  query Categories {
    categories {
      categoryId
      categoryName
      description
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query ProductsByCategory($categoryId: ID!) {
    productsByCategory(categoryId: $categoryId) {
      productId
      productName
      basePrice
      sku
    }
  }
`;

export const GET_PRODUCTS = gql`
  query Products {
    products {
      productId
      productName
      basePrice
      sku
      category {
        categoryId
        categoryName
      }
    }
  }
`;

export const ASSOCIATE_PRODUCTS_TO_PROMOTION = gql`
  mutation AssociateProductsToPromotion($promotionId: ID!, $productIds: [ID!]!) {
    associateProductsToPromotion(promotionId: $promotionId, productIds: $productIds) {
      promotionId
      promotionName
      products {
        productId
        productName
        basePrice
        sku
      }
    }
  }
`;

export const REMOVE_PRODUCTS_FROM_PROMOTION = gql`
  mutation RemoveProductsFromPromotion($promotionId: ID!, $productIds: [ID!]!) {
    removeProductsFromPromotion(promotionId: $promotionId, productIds: $productIds) {
      promotionId
      promotionName
      products {
        productId
        productName
        basePrice
        sku
      }
    }
  }
`;

export interface Category {
  categoryId: number;
  categoryName: string;
  description: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface Product {
  productId: number;
  productName: string;
  basePrice: number;
  sku: string;
}

export interface ProductsByCategoryResponse {
  productsByCategory: Product[];
}

// --------------- PROMOTION FILTER QUERIES ---------------
export const GET_ACTIVE_PROMOTIONS = gql`
  query PromotionsActive {
    promotionsActive {
      promotionId
      promotionName
      description
      startDate
      endDate
      discountPercentage
      status {
        statusId
        statusName
      }
      user {
        userId
        userName
        email
      }
      category {
        categoryId
        categoryName
        description
      }
      products {
        productId
        productName
        basePrice
        sku
      }
    }
  }
`;

export const GET_EXPIRED_PROMOTIONS = gql`
  query PromotionsExpired {
    promotionsExpired {
      promotionId
      promotionName
      description
      startDate
      endDate
      discountPercentage
      status {
        statusId
        statusName
      }
      user {
        userId
        userName
        email
      }
      category {
        categoryId
        categoryName
        description
      }
      products {
        productId
        productName
        basePrice
        sku
      }
    }
  }
`;

export const GET_SCHEDULED_PROMOTIONS = gql`
  query PromotionsScheduled {
    promotionsScheduled {
      promotionId
      promotionName
      description
      startDate
      endDate
      discountPercentage
      status {
        statusId
        statusName
      }
      user {
        userId
        userName
        email
      }
      category {
        categoryId
        categoryName
        description
      }
      products {
        productId
        productName
        basePrice
        sku
      }
    }
  }
`;

export interface PromotionDeleted {
  promotionId: string;
  promotionName: string;
  description: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
  status: {
    statusId: string;
    statusName: string;
  };
  user: {
    userId: number;
    userName: string;
    email: string;
  };
  category: {
    categoryId: number;
    categoryName: string;
    description: string;
  };
  deletedAt: string;
  deletedBy: {
    userId: number;
    userName: string;
    email: string;
  };
  daysUntilPurge: number;
}

export const GET_DELETED_PROMOTIONS = gql`
  query DeletedPromotions {
    deletedPromotions {
      promotionId
      promotionName
      description
      startDate
      endDate
      discountPercentage
      status {
        statusId
        statusName
      }
      user {
        userId
        userName
        email
      }
      category {
        categoryId
        categoryName
        description
      }
      deletedAt
      deletedBy {
        userId
        userName
        email
      }
      daysUntilPurge
    }
  }
`;

export interface ActivePromotionsResponse {
  promotionsActive: Promotion[];
}

export interface ExpiredPromotionsResponse {
  promotionsExpired: Promotion[];
}

export interface ScheduledPromotionsResponse {
  promotionsScheduled: Promotion[];
}

// --------------- PROMOTION METRICS QUERIES/MUTATIONS ---------------
export interface ProductMetrics {
  productId: string;
  productName: string;
  productSku: string;
  basePrice: number;
  discountedPrice: number;
  initialInventory: number;
  currentInventory: number;
  inventoryDifference: number;
  inventoryReductionPercentage: number;
  unitsSold: number;
  skuVariationPercentage: number | null;
  revenueGenerated: number;
  category: {
    categoryId: string;
    categoryName: string;
    description: string;
  };
  lastUpdated: string | null;
}

export interface PromotionPerformance {
  promotionId: string;
  promotionName: string;
  promotionDescription: string | null;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalProducts: number;
  totalUnitsSold: number;
  totalRevenue: number;
  totalInitialInventory: number;
  totalCurrentInventory: number;
  totalInventoryDifference: number;
  inventoryReductionPercentage: number;
  averageSkuVariationPercentage: number | null;
  lastUpdated: string | null;
  productMetrics: ProductMetrics[];
}

export interface PromotionPerformanceResponse {
  promotionPerformance: PromotionPerformance | null;
}

export interface PromotionHasMetricsResponse {
  promotionHasMetrics: boolean;
}

export interface ProductMetricsResponse {
  promotionProductMetrics: ProductMetrics[];
}

export interface InitializeMetricsResponse {
  initializePromotionMetrics: boolean;
}

export interface SimulateMetricsResponse {
  simulateMetricsUpdate: boolean;
}

export const CHECK_PROMOTION_HAS_METRICS = gql`
  query PromotionHasMetrics($promotionId: ID!) {
    promotionHasMetrics(promotionId: $promotionId)
  }
`;

export const GET_PROMOTION_PERFORMANCE = gql`
  query GetPromotionPerformance($promotionId: ID!) {
    promotionPerformance(promotionId: $promotionId) {
      promotionId
      promotionName
      promotionDescription
      discountPercentage
      startDate
      endDate
      isActive
      totalProducts
      totalUnitsSold
      totalRevenue
      totalInitialInventory
      totalCurrentInventory
      totalInventoryDifference
      inventoryReductionPercentage
      averageSkuVariationPercentage
      lastUpdated
      productMetrics {
        productId
        productName
        productSku
        basePrice
        discountedPrice
        initialInventory
        currentInventory
        inventoryDifference
        inventoryReductionPercentage
        unitsSold
        skuVariationPercentage
        revenueGenerated
        category {
          categoryId
          categoryName
          description
        }
        lastUpdated
      }
    }
  }
`;

export const GET_PROMOTION_PRODUCT_METRICS = gql`
  query GetPromotionProductMetrics($promotionId: ID!) {
    promotionProductMetrics(promotionId: $promotionId) {
      productId
      productName
      productSku
      basePrice
      discountedPrice
      initialInventory
      currentInventory
      inventoryDifference
      inventoryReductionPercentage
      unitsSold
      skuVariationPercentage
      revenueGenerated
      category {
        categoryId
        categoryName
        description
      }
      lastUpdated
    }
  }
`;

export const INITIALIZE_PROMOTION_METRICS = gql`
  mutation InitializePromotionMetrics($promotionId: ID!) {
    initializePromotionMetrics(promotionId: $promotionId)
  }
`;

export const SIMULATE_METRICS_UPDATE = gql`
  mutation SimulateMetricsUpdate($promotionId: ID!, $productId: ID!, $unitsSold: Int!) {
    simulateMetricsUpdate(promotionId: $promotionId, productId: $productId, unitsSold: $unitsSold)
  }
`;

