import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, RotateCcw, XCircle, BarChart3 } from 'lucide-react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { DeletePromotionDialog } from '@/components/DeletePromotionDialog';
import { PromotionFilters, PromotionStatus } from '@/components/PromotionFilters';
import { usePromotionFilters } from '@/hooks/usePromotionsFilter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DELETE_PROMOTION,
  RESTORE_PROMOTION,
  PERMANENTLY_DELETE_PROMOTION,
  type Promotion,
  type PromotionDeleted,
  type DeletePromotionResponse,
  type RestorePromotionResponse,
  type PermanentDeletePromotionResponse
} from '@/services/promotionService';
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
import { GET_CURRENT_USER, type CurrentUserResponse } from '@/services/authService';

const PromotionsList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<{ id: string; name: string } | null>(null);
  const [selectedPromotionDescription, setSelectedPromotionDescription] = useState<{ name: string; description: string } | null>(null);
  const [filter, setFilter] = useState<PromotionStatus>('ALL');

  const { promotions, loading, error, refetch } = usePromotionFilters(filter);

  const { data: currentUserData } = useQuery<CurrentUserResponse>(GET_CURRENT_USER);

  const [deletePromotion, { loading: deleting }] = useMutation<DeletePromotionResponse>(DELETE_PROMOTION);
  const [restorePromotion, { loading: restoring }] = useMutation<RestorePromotionResponse>(RESTORE_PROMOTION);
  const [permanentlyDeletePromotion, { loading: permanentDeleting }] = useMutation<PermanentDeletePromotionResponse>(PERMANENTLY_DELETE_PROMOTION);

  const getPromotionImage = (categoryName: string) => {
    const images: Record<string, string> = {
      'alimentos': foodPromotions,
      'accesorios': accessoriesPromotions,
      'higiene': hygienePromotions,
      'salud': healthPromotions,
      'juguetes': toysPromotions,
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

  //REVISAR
  const isDeletedPromotion = (promo: Promotion | PromotionDeleted): promo is PromotionDeleted => {
    return 'deletedAt' in promo;
  };

  //REVISAR
  const handleDeleteClick = (id: string, name: string) => {
    setSelectedPromotion({ id, name });
    setDeleteDialogOpen(true);
  };

  //REVISAR
  const handleDeleteConfirm = async () => {
    if (!selectedPromotion) return;

    try {
      if (!currentUserData?.currentUser?.userId) {
        toast({
          title: "Error",
          description: "No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        });
        return;
      }

      const { data: deleteData } = await deletePromotion({
        variables: {
          id: selectedPromotion.id,
          userId: Number(currentUserData.currentUser.userId)
        }
      });

      if (deleteData?.deletePromotion) {
        toast({
          title: "Promoción eliminada",
          description: "La promoción se ha movido a la papelera",
        });
        setDeleteDialogOpen(false);
        setSelectedPromotion(null);
        refetch();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la promoción",
        variant: "destructive"
      });
    }
  };

  //REVISAR
  const handlePermanentDelete = async (id: string, name: string) => {
    if (!confirm(`¿Está seguro de eliminar permanentemente "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const { data: deleteData } = await permanentlyDeletePromotion({
        variables: {
          id,
          userId: Number(currentUserData.currentUser.userId)
        }
      });

      if (deleteData?.permanentDeletePromotion) {
        toast({
          title: "Promoción eliminada permanentemente",
          description: "La promoción ha sido eliminada completamente del sistema",
        });
        refetch();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar permanentemente la promoción",
        variant: "destructive"
      });
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const { data: restoreData } = await restorePromotion({
        variables: {
          id,
          userId: Number(currentUserData.currentUser.userId)
        }
      });

      if (restoreData?.restorePromotion) {
        toast({
          title: "Promoción restaurada",
          description: "La promoción ha sido restaurada exitosamente",
        });
        refetch();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo restaurar la promoción",
        variant: "destructive"
      });
    }
  };

  const isTrashView = filter === 'TRASH';

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
                onClick={() => setFilter('ALL')}
                className="flex items-center gap-2"
              >
                <XCircle size={20} />
                Salir de Papelera
              </Button>
            )}
          </div>

          {promotions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">
                {isTrashView
                  ? 'No hay promociones en la papelera'
                  : filter === 'ACTIVE'
                    ? 'No hay promociones activas en este momento'
                    : filter === 'SCHEDULE'
                      ? 'No hay promociones programadas'
                      : filter === 'EXPIRED'
                        ? 'No hay promociones vencidas'
                        : 'No hay promociones disponibles'}
              </p>
              {filter === 'ACTIVE' && (
                <p className="text-muted-foreground text-sm mt-2">
                  Las promociones activas son aquellas cuya fecha de inicio ya llegó y aún no han expirado.
                </p>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {promotions.map((promotion) => {
                const isDeleted = isDeletedPromotion(promotion);

                return (
                  <Card
                    key={promotion.promotionId}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div 
                        className="md:w-48 h-48 md:h-auto bg-custom-beige cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setSelectedPromotionDescription({
                            name: promotion.promotionName,
                            description: promotion.description || 'Sin descripción'
                          });
                          setDescriptionDialogOpen(true);
                        }}
                      >
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
                            {promotion.description || 'Sin descripción'}
                          </p>

                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>
                              Vigencia: {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                            </p>
                            <p>Categoría: {promotion.category.categoryName}</p>
                            {!isDeleted && 'products' in promotion && (
                              <p>Productos: {promotion.products?.length || 0}</p>
                            )}
                            <p>Estado: {promotion.status.statusName}</p>

                            {isDeleted && (
                              <>
                                <p className="text-destructive font-medium pt-2">
                                  📅 Eliminada: {formatDate(promotion.deletedAt)}
                                </p>
                                <p className="text-destructive">
                                  ⏰ Se eliminará permanentemente en {promotion.daysUntilPurge} días
                                </p>
                                {promotion.deletedBy && (
                                  <p className="text-muted-foreground">
                                    Eliminada por: {promotion.deletedBy.userName}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          {!isTrashView ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1"
                                onClick={() => navigate(`/admin/promotions/${promotion.promotionId}/metrics`)}
                              >
                                <BarChart3 size={16} />
                                Ver Métricas
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
                                disabled={deleting}
                              >
                                <Trash2 size={16} />
                                {deleting ? 'Eliminando...' : 'Eliminar'}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-success hover:bg-success hover:text-success-foreground"
                                onClick={() => handleRestore(promotion.promotionId)}
                                disabled={restoring}
                              >
                                <RotateCcw size={16} />
                                {restoring ? 'Restaurando...' : 'Restaurar'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => handlePermanentDelete(promotion.promotionId, promotion.promotionName)}
                                disabled={permanentDeleting}
                              >
                                <Trash2 size={16} />
                                {permanentDeleting ? 'Eliminando...' : 'Eliminar permanentemente'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
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

      <Dialog open={descriptionDialogOpen} onOpenChange={setDescriptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPromotionDescription?.name}</DialogTitle>
            <DialogDescription className="pt-4">
              {selectedPromotionDescription?.description}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PromotionsList;