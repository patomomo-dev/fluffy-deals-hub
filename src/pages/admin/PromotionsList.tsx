import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { DeletePromotionDialog } from '@/components/DeletePromotionDialog';
import { PromotionFilters, PromotionStatus } from '@/components/PromotionFilters';
import storeLogo from '@/assets/PetStore-Logo.png';
import foodPromotions from '@/assets/food-promotions.png';
import hygienePromotions from '@/assets/hygiene-promotions.png';
import healthPromotions from '@/assets/health-promotions.png';
import toysPromotions from '@/assets/toys-promotions.png';
import transportPromotions from '@/assets/transport-promotions.png';
import clothesPromotions from '@/assets/clothes-promotions.png';
import aquariumPromotions from '@/assets/aquarium-promotions.png';
import trainPromotions from '@/assets/train-promotions.png';
import breedingPromotions from '@/assets/breeding-promotions.png';
import accessoriesPromotions from '@/assets/accessories-promotions.png';
import { useQuery } from '@apollo/client/react';
import { GET_PROMOTIONS, PromotionsResponse } from '@/services/promotionService';

const PromotionsList = () => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<{ id: string; name: string } | null>(null);
  const [filter, setFilter] = useState<PromotionStatus>('all');

  console.log('🔵 PromotionsList render - deleteDialogOpen:', deleteDialogOpen);
  console.log('🔵 selectedPromotion:', selectedPromotion);

  const { data, loading, error, refetch } = useQuery<PromotionsResponse>(GET_PROMOTIONS);

  const getPromotionImage = (categoryName: string) => {
    const images: Record<string, string> = {
      'alimentos': foodPromotions,
      'accesorios': accessoriesPromotions,
      'higiene': hygienePromotions,
      'salud': healthPromotions,
      'jueguetes': toysPromotions,
      'transporte': transportPromotions,
      'ropa': clothesPromotions,
      'acuarios y terrarios': aquariumPromotions,
      'entrenamiento': trainPromotions,
      'ganadería': breedingPromotions
    };
    return images[categoryName.toLowerCase()] || storeLogo;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPromotionStatus = (promotion: { startDate: string; endDate: string; status: { statusName: string } }): PromotionStatus => {
    const statusName = promotion.status.statusName.toLowerCase();

    if (statusName.includes('inactive') || statusName.includes('expired')) return 'trash';

    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (now < start) return 'scheduled';
    if (now > end) return 'expired';
    return 'active';
  };

  const filteredPromotions = data?.promotions.filter(promo => {
    const status = getPromotionStatus(promo);

    if (filter === 'all') return status !== 'trash';
    if (filter === 'trash') return status === 'trash';
    return status === filter;
  }) || [];

  const handleDeleteClick = (id: string, name: string) => {
    console.log('🔴 Click en Eliminar - ID:', id, 'Name:', name);
    setSelectedPromotion({ id, name });
    setDeleteDialogOpen(true);
    console.log('🔴 Estados actualizados');
  };

  const handleDeleteConfirm = () => {
    if (selectedPromotion) {
      //Implement delete logic here
      toast({
        title: "Promoción eliminada",
        description: "La promoción se ha movido a la papelera",
      });
      setDeleteDialogOpen(false);
      setSelectedPromotion(null);
      refetch();
    }
  };

  const handlePermanentDelete = (id: string, name: string) => {
    if (confirm(`¿Está seguro de eliminar permanentemente "${name}"? Esta acción no se puede deshacer.`)) {
      //Implement permanent delete logic here
      toast({
        title: "Promoción eliminada permanentemente",
        description: "La promoción ha sido eliminada completamente",
      });
      refetch();
    }
  };

  const handleRestore = (id: string) => {
    //Implement restore logic here
    toast({
      title: "Promoción restaurada",
      description: "La promoción ha sido restaurada exitosamente",
    });
    refetch();
  };

  const isTrashView = filter === 'trash';

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Cargando promociones...</p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <Card className="p-12 text-center">
            <p className="text-destructive">Error al cargar promociones: {error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Reintentar
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Promociones</h1>
              <PromotionFilters selectedFilter={filter} onFilterChange={setFilter} />
            </div>

            {!isTrashView && (
              <Link to="/admin/promotions/create">
                <Button
                  className="bg-success hover:bg-success/90 text-success-foreground flex items-center gap-2 rounded-full shadow-lg"
                  size="lg"
                >
                  <Plus size={20} />
                  Crear
                </Button>
              </Link>
            )}

            {isTrashView && (
              <Button
                variant="outline"
                onClick={() => setFilter('all')}
                className="flex items-center gap-2"
              >
                <XCircle size={20} />
                Salir de Papelera
              </Button>
            )}
          </div>

          {filteredPromotions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                {isTrashView
                  ? 'No hay promociones en la papelera'
                  : 'No hay promociones disponibles'}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPromotions.map((promotion) => (
                <Card
                  key={promotion.promotionId}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-48 md:h-auto bg-custom-beige">
                      <img
                        src={getPromotionImage(promotion.category.categoryName)}
                        alt={promotion.promotionName}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-primary">
                            {promotion.promotionName}
                          </h3>
                          <span className="bg-success text-success-foreground px-3 py-1 rounded-full text-sm font-medium">
                            {promotion.discountPercentage}% OFF
                          </span>
                        </div>

                        <p className="text-muted-foreground mb-4">
                          {promotion.description}
                        </p>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            Vigencia: {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                          </p>
                          <p>Categoría: {promotion.category.categoryName}</p>
                          <p>Productos: {promotion.products.length}</p>
                          <p>Estado: {promotion.status.statusName}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        {!isTrashView ? (
                          <>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Eye size={16} />
                              Ver
                            </Button>
                            <Link to={`/admin/promotions/${promotion.promotionId}/edit`}>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <Edit size={16} />
                                Editar
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleDeleteClick(promotion.promotionId, promotion.promotionName)}
                            >
                              <Trash2 size={16} />
                              Eliminar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-success hover:bg-success hover:text-success-foreground"
                              onClick={() => handleRestore(promotion.promotionId)}
                            >
                              <RotateCcw size={16} />
                              Restaurar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handlePermanentDelete(promotion.promotionId, promotion.promotionName)}
                            >
                              <Trash2 size={16} />
                              Eliminar permanentemente
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>

      <DeletePromotionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        promotionName={selectedPromotion?.name || ''}
      />
    </>
  );
};

export default PromotionsList;
