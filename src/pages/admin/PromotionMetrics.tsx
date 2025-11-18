import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, MousePointer, ShoppingCart, TrendingUp, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { promotionService, type Promotion } from '@/services/promotionService';
import { useToast } from '@/hooks/use-toast';

const PromotionMetrics = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [promotion, setPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    if (!id) {
      toast({ title: 'Error', description: 'ID de promoción no válido', variant: 'destructive' });
      navigate('/admin/promotions');
      return;
    }

    const promo = promotionService.findById(id);
    if (!promo) {
      toast({ title: 'Error', description: 'Promoción no encontrada', variant: 'destructive' });
      navigate('/admin/promotions');
      return;
    }

    setPromotion(promo);
  }, [id, navigate, toast]);

  if (!promotion) {
    return null;
  }

  // Métricas simuladas basadas en el ID de la promoción
  const seedValue = parseInt(promotion.id) || 1000;
  const views = Math.floor(seedValue * 1.5 + Math.random() * 500);
  const clicks = Math.floor(views * 0.35 + Math.random() * 100);
  const conversions = Math.floor(clicks * 0.15 + Math.random() * 20);
  const conversionRate = ((conversions / clicks) * 100).toFixed(1);
  const revenue = (conversions * (80 + Math.random() * 120)).toFixed(2);

  const categories = promotionService.getCategories();
  const category = categories.find(c => c.id === promotion.category);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const metricsCards = [
    {
      title: 'Vistas',
      value: views.toLocaleString(),
      icon: Eye,
      description: 'Usuarios que vieron la promoción',
      color: 'text-blue-600'
    },
    {
      title: 'Clics',
      value: clicks.toLocaleString(),
      icon: MousePointer,
      description: 'Clics en productos promocionados',
      color: 'text-purple-600'
    },
    {
      title: 'Conversiones',
      value: conversions.toLocaleString(),
      icon: ShoppingCart,
      description: 'Ventas realizadas',
      color: 'text-green-600'
    },
    {
      title: 'Tasa de Conversión',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      description: 'Porcentaje de clics que convirtieron',
      color: 'text-orange-600'
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Link to="/admin/promotions">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft size={16} />
              Volver a Promociones
            </Button>
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">{promotion.name}</h1>
              <p className="text-muted-foreground">{promotion.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="text-primary" size={24} />
                <div>
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="font-semibold">{formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Tag className="text-primary" size={24} />
                <div>
                  <p className="text-sm text-muted-foreground">Categoría y Descuento</p>
                  <p className="font-semibold">{category?.name || 'Sin categoría'} • {promotion.discount}% OFF</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold text-primary mb-4">Métricas de Rendimiento</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metricsCards.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Icon className={metric.color} size={18} />
                    {metric.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
            <CardDescription>Ingresos generados por esta promoción</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-success">€{revenue}</span>
              <span className="text-muted-foreground">en ventas totales</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Productos en promoción</p>
                <p className="text-xl font-semibold">{promotion.productIds.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ticket promedio</p>
                <p className="text-xl font-semibold">€{(parseFloat(revenue) / conversions).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PromotionMetrics;
