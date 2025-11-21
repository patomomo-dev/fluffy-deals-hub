import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Eye, MousePointer, ShoppingCart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { usePromotionFilters } from '@/hooks/usePromotionsFilter';

const PromotionMetrics = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { promotions, loading } = usePromotionFilters('ALL');

  const promotion = promotions.find(p => p.promotionId === id);

  // Datos simulados de métricas
  const metrics = {
    views: Math.floor(Math.random() * 5000) + 1000,
    clicks: Math.floor(Math.random() * 1000) + 200,
    conversions: Math.floor(Math.random() * 200) + 50,
    revenue: (Math.random() * 50000 + 10000).toFixed(2),
  };

  const conversionRate = ((metrics.conversions / metrics.clicks) * 100).toFixed(2);
  const clickRate = ((metrics.clicks / metrics.views) * 100).toFixed(2);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Cargando métricas...</p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!promotion) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <Card className="p-12 text-center">
            <p className="text-destructive">Promoción no encontrada</p>
            <Button onClick={() => navigate('/admin/promotions')} className="mt-4">
              Volver a Promociones
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/promotions')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">{promotion.promotionName}</h1>
            <p className="text-muted-foreground">Métricas de rendimiento</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vistas Totales</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.views.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12.5% desde el inicio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clics</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.clicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Tasa de clic: {clickRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversiones</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.conversions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Tasa de conversión: {conversionRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Generados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.revenue}</div>
              <p className="text-xs text-muted-foreground">
                +8.3% vs. objetivo
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Promoción</CardTitle>
              <CardDescription>Información general</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuento:</span>
                <span className="font-medium">{promotion.discountPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoría:</span>
                <span className="font-medium">{promotion.category.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <span className="font-medium">{promotion.status.statusName}</span>
              </div>
              {'products' in promotion && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Productos:</span>
                  <span className="font-medium">{promotion.products?.length || 0}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análisis de Rendimiento</CardTitle>
              <CardDescription>Indicadores clave</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">CTR (Click-Through Rate):</span>
                <span className="font-medium">{clickRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tasa de Conversión:</span>
                <span className="font-medium">{conversionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ingreso por Conversión:</span>
                <span className="font-medium">${(parseFloat(metrics.revenue) / metrics.conversions).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desempeño:</span>
                <span className="font-medium text-success">Excelente</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PromotionMetrics;
