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
  mutation DeletePromotion($id: ID!) {
    deletePromotion(id: $id) {
      promotionId
      status {
        statusId
        statusName
      }
    }
  }
`;

//MODIFICAR
export const RESTORE_PROMOTION = gql`
  mutation RestorePromotion($id: ID!) {
    restorePromotion(id: $id) {
      promotionId
      status {
        statusId
        statusName
      }
    }
  }
`;

//MODIFICAR
export const PERMANENTLY_DELETE_PROMOTION = gql`
  mutation PermanentlyDeletePromotion($id: ID!) {
    permanentlyDeletePromotion(id: $id)
  }
`;

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


