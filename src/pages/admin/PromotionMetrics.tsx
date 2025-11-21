import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Eye, MousePointer, ShoppingCart, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { usePromotionFilters } from '@/hooks/usePromotionsFilter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

// Simulación de datos de inventario de productos
interface ProductInventory {
  productId: string;
  productName: string;
  initialStock: number;
  finalStock: number;
  unitsSold: number;
  variation: number;
}

const generateProductInventory = (promotion: any): ProductInventory[] => {
  if (!promotion || !('products' in promotion) || !promotion.products?.length) {
    return [];
  }

  return promotion.products.map((product: any) => {
    const initialStock = Math.floor(Math.random() * 200) + 50;
    const unitsSold = Math.floor(Math.random() * 100) + 10;
    const finalStock = initialStock - unitsSold;
    const variation = ((unitsSold / initialStock) * 100);

    return {
      productId: product.productId,
      productName: product.productName,
      initialStock,
      finalStock,
      unitsSold,
      variation,
    };
  });
};

const PromotionMetrics = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { promotions, loading } = usePromotionFilters('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const promotion = promotions.find(p => p.promotionId === id);

  // Datos simulados de métricas con estado para actualizaciones dinámicas
  const [metrics, setMetrics] = useState({
    views: Math.floor(Math.random() * 5000) + 1000,
    clicks: Math.floor(Math.random() * 1000) + 200,
    conversions: Math.floor(Math.random() * 200) + 50,
    revenue: (Math.random() * 50000 + 10000).toFixed(2),
  });

  const [productInventory, setProductInventory] = useState<ProductInventory[]>([]);

  // Actualización dinámica cada 10 segundos
  useEffect(() => {
    if (promotion) {
      setProductInventory(generateProductInventory(promotion));
    }
  }, [promotion]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      
      // Simular actualización de métricas
      setTimeout(() => {
        setMetrics({
          views: Math.floor(Math.random() * 5000) + 1000,
          clicks: Math.floor(Math.random() * 1000) + 200,
          conversions: Math.floor(Math.random() * 200) + 50,
          revenue: (Math.random() * 50000 + 10000).toFixed(2),
        });
        
        if (promotion) {
          setProductInventory(generateProductInventory(promotion));
        }
        
        setLastUpdate(new Date());
        setIsRefreshing(false);
      }, 500);
    }, 10000); // Actualizar cada 10 segundos

    return () => clearInterval(interval);
  }, [promotion]);

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
          <Card className="p-12 text-center" role="alert" aria-live="polite">
            <p className="text-destructive">Promoción no encontrada</p>
            <Button 
              onClick={() => navigate('/admin/promotions')} 
              className="mt-4"
              aria-label="Volver a la lista de promociones"
            >
              Volver a Promociones
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const hasMetrics = productInventory.length > 0;

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/promotions')}
              className="flex items-center gap-2"
              aria-label="Volver a la lista de promociones"
            >
              <ArrowLeft size={16} />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">{promotion.promotionName}</h1>
              <p className="text-muted-foreground">Métricas de rendimiento</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw 
              size={16} 
              className={isRefreshing ? 'animate-spin' : ''} 
              aria-hidden="true"
            />
            <span aria-live="polite" aria-atomic="true">
              {isRefreshing ? 'Actualizando...' : `Última actualización: ${lastUpdate.toLocaleTimeString()}`}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8" role="region" aria-label="Métricas principales">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vistas Totales</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              {isRefreshing ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <div className="text-2xl font-bold" aria-label={`${metrics.views.toLocaleString()} vistas totales`}>
                  {metrics.views.toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                +12.5% desde el inicio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clics</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              {isRefreshing ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <div className="text-2xl font-bold" aria-label={`${metrics.clicks.toLocaleString()} clics`}>
                  {metrics.clicks.toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Tasa de clic: {clickRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversiones</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              {isRefreshing ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <div className="text-2xl font-bold" aria-label={`${metrics.conversions.toLocaleString()} conversiones`}>
                  {metrics.conversions.toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Tasa de conversión: {conversionRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Generados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              {isRefreshing ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <div className="text-2xl font-bold" aria-label={`${metrics.revenue} dólares en ingresos`}>
                  ${metrics.revenue}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                +8.3% vs. objetivo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de variación de inventario */}
        <Card className="mb-8" role="region" aria-label="Variación de inventario de productos">
          <CardHeader>
            <CardTitle>Variación de Inventario de Productos</CardTitle>
            <CardDescription>
              {hasMetrics 
                ? 'Cantidad inicial, final y diferencia por producto asociado' 
                : 'No hay productos asociados a esta promoción'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasMetrics ? (
              <div className="text-center py-8 text-muted-foreground" role="status">
                No hay datos disponibles para esta promoción
              </div>
            ) : isRefreshing ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Stock Inicial</TableHead>
                    <TableHead className="text-right">Unidades Vendidas</TableHead>
                    <TableHead className="text-right">Stock Final</TableHead>
                    <TableHead className="text-right">Variación</TableHead>
                    <TableHead className="text-right">Progreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productInventory.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right">{item.initialStock}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" aria-label={`${item.unitsSold} unidades vendidas`}>
                          {item.unitsSold}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.finalStock}</TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={item.variation > 50 ? "default" : "outline"}
                          aria-label={`${item.variation.toFixed(1)} por ciento de variación`}
                        >
                          {item.variation.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={item.variation} 
                            className="w-24"
                            aria-label={`Progreso de ventas: ${item.variation.toFixed(1)}%`}
                          />
                          <span className="text-xs text-muted-foreground" aria-hidden="true">
                            {item.variation.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

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
