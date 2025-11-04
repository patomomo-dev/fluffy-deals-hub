import { gql } from '@apollo/client';

export interface Promotion {
    promotionId: string;
    promotionName: string;
    description: string;
    startDate: string;
    endDate: string;
    discountValue: number;
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

export const GET_PROMOTIONS = gql`
  query Promotions {
    promotions {
      promotionId
      promotionName
      description
      startDate
      endDate
      discountValue
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