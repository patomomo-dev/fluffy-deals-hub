import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { DeletePromotionDialog } from '@/components/DeletePromotionDialog';
import { PromotionFilters, PromotionStatus } from '@/components/PromotionFilters';
import { promotionService, type Promotion } from '@/services/promotionService';
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

const PromotionsList = () => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<{ id: string; name: string } | null>(null);
  const [filter, setFilter] = useState<PromotionStatus>('ALL');
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  const loadPromotions = () => {
    let data: Promotion[] = [];
    
    switch (filter) {
      case 'ALL':
        data = promotionService.getActive();
        break;
      case 'SCHEDULED':
        data = promotionService.getScheduled();
        break;
      case 'EXPIRED':
        data = promotionService.getExpired();
        break;
      case 'TRASH':
        data = promotionService.getDeleted();
        break;
    }
    
    setPromotions(data);
  };

  useEffect(() => {
    loadPromotions();
  }, [filter]);

  const getPromotionImage = (categoryId: string) => {
    const categories = promotionService.getCategories();
    const category = categories.find(c => c.id === categoryId);
    const categoryName = category?.name.toLowerCase() || '';
    
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
    return images[categoryName] || foodPromotions;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedPromotion({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPromotion) return;
    promotionService.remove(selectedPromotion.id);
    toast({ title: 'Promoción eliminada' });
    loadPromotions();
    setDeleteDialogOpen(false);
    setSelectedPromotion(null);
  };

  const handlePermanentDelete = (id: string, name: string) => {
    if (!confirm(`¿Eliminar permanentemente "${name}"?`)) return;
    promotionService.purge(id);
    toast({ title: 'Promoción eliminada permanentemente' });
    loadPromotions();
  };

  const handleRestore = (id: string) => {
    promotionService.restore(id);
    toast({ title: 'Promoción restaurada' });
    loadPromotions();
  };

  const isTrashView = filter === 'TRASH';

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
                <Button className="bg-success hover:bg-success/90 text-success-foreground flex items-center gap-2 rounded-full shadow-lg">
                  <Plus size={20} />
                  Crear
                </Button>
              </Link>
            )}
          </div>

          {promotions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                {isTrashView ? 'No hay promociones en la papelera' : 'No hay promociones disponibles'}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {promotions.map((promo) => {
                const categories = promotionService.getCategories();
                const category = categories.find(c => c.id === promo.category);
                
                return (
                  <Card key={promo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 lg:w-1/4">
                        <img src={getPromotionImage(promo.category)} alt={promo.name} className="w-full h-48 md:h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 p-6">
                        <h2 className="text-2xl font-bold text-primary mb-2">{promo.name}</h2>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>{category?.name || 'Sin categoría'}</span>
                          <span>•</span>
                          <span>{promo.discount}% de descuento</span>
                        </div>
                        <p className="text-foreground mb-4 mt-2 line-clamp-2">{promo.description}</p>
                        <div className="flex gap-2 text-sm text-muted-foreground mb-4">
                          <span>Inicio: {formatDate(promo.startDate)}</span>
                          <span>•</span>
                          <span>Fin: {formatDate(promo.endDate)}</span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {!isTrashView ? (
                            <>
                              <Link to={`/admin/promotions/${promo.id}/edit`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Edit size={16} />
                                  Editar
                                </Button>
                              </Link>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteClick(promo.id, promo.name)} className="gap-2 text-destructive">
                                <Trash2 size={16} />
                                Eliminar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleRestore(promo.id)} className="gap-2 text-success">
                                <RotateCcw size={16} />
                                Restaurar
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handlePermanentDelete(promo.id, promo.name)} className="gap-2 text-destructive">
                                <XCircle size={16} />
                                Purgar
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

      <DeletePromotionDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} promotionName={selectedPromotion?.name || ''} />
    </>
  );
};

export default PromotionsList;
