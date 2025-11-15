import { gql } from '@apollo/client';

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

//MODIFICAR
export const DELETE_PROMOTION = gql`
  mutation DeletePromotion($id: ID!, $userId: ID) {
    deletePromotion(id: $id, userId: $userId)
  }
`;

export interface DeletePromotionResponse {
  deletePromotion: boolean;
}

//MODIFICAR
export const RESTORE_PROMOTION = gql`
  mutation RestorePromotion($id: ID!, $userId: ID!) {
    restorePromotion(id: $id, userId: $userId)
  }
`;

export interface RestorePromotionResponse {
  restorePromotion: boolean;
}

//MODIFICAR
export const PERMANENTLY_DELETE_PROMOTION = gql`
  mutation PermanentDeletePromotion($id: ID!, $userId: ID!) {
    permanentDeletePromotion(id: $id, userId: $userId)
  }
`;

export interface PermanentDeletePromotionResponse {
  permanentDeletePromotion: boolean;
}

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

