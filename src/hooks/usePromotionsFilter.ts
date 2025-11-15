import { useQuery } from '@apollo/client/react';
import { PromotionStatus } from '@/components/PromotionFilters';
import {
    GET_PROMOTIONS,
    GET_ACTIVE_PROMOTIONS,
    GET_EXPIRED_PROMOTIONS,
    GET_SCHEDULED_PROMOTIONS,
    GET_DELETED_PROMOTIONS,
    type Promotion,
    type PromotionDeleted,
    type PromotionsResponse,
    type ActivePromotionsResponse,
    type ExpiredPromotionsResponse,
    type ScheduledPromotionsResponse,
    type DeletePromotionResponse
} from '@/services/promotionService';

type QueryResponse =
    | PromotionsResponse
    | ActivePromotionsResponse
    | ExpiredPromotionsResponse
    | ScheduledPromotionsResponse
    | DeletePromotionResponse;

export const usePromotionFilters = (selectedFilter: PromotionStatus) => {
    // Configuración de query según el filtro
    const queryConfig = {
        ALL: { query: GET_PROMOTIONS, dataKey: 'promotions' as const },
        ACTIVE: { query: GET_ACTIVE_PROMOTIONS, dataKey: 'promotionsActive' as const },
        SCHEDULE: { query: GET_SCHEDULED_PROMOTIONS, dataKey: 'promotionsScheduled' as const },
        EXPIRED: { query: GET_EXPIRED_PROMOTIONS, dataKey: 'promotionsExpired' as const },
        TRASH: { query: GET_DELETED_PROMOTIONS, dataKey: 'deletedPromotions' as const },
    };

    const config = queryConfig[selectedFilter];

    const { data, loading, error, refetch } = useQuery<QueryResponse>(config.query, {
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

  
    const getPromotions = (): (Promotion | PromotionDeleted)[] => {
        if (!data) return [];

        return data[config.dataKey] || [];
    };

    return {
        promotions: getPromotions(),
        loading,
        error,
        refetch,
    };
};