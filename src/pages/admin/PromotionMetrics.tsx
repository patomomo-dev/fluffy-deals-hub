import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, RefreshCw } from 'lucide-react';
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
  unitPrice: number;
  revenue: number;
}

const generateProductInventory = (promotion: any): ProductInventory[] => {
  if (!promotion || !('products' in promotion) || !promotion.products?.length) {
    return [];
  }

  return promotion.products.map((product: any) => {
    const initialStock = Math.floor(Math.random() * 200) + 50;

    const unitsSold = Math.min(
      Math.floor(Math.random() * 100) + 10,
      initialStock
    );

    const finalStock = initialStock - unitsSold;
    const variation = (unitsSold / initialStock) * 100;

    const unitPrice = Math.floor(Math.random() * 90) + 10;

    return {
      productId: product.productId,
      productName: product.productName,
      initialStock,
      finalStock,
      unitsSold,
      variation,
      unitPrice,
      revenue: unitPrice * unitsSold
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

  const [metrics, setMetrics] = useState({
    revenue: '0.00'
  });

  const [productInventory, setProductInventory] = useState<ProductInventory[]>([]);

  // Actualizar inventario cuando cargue la promoción
  useEffect(() => {
    if (promotion) {
      setProductInventory(generateProductInventory(promotion));
    }
  }, [promotion]);

  // Calcular ingresos totales correctamente: Σ(unitPrice × unitsSold)
  useEffect(() => {
    const totalRevenue = productInventory.reduce(
      (sum, item) => sum + item.unitPrice * item.unitsSold,
      0
    );

    setMetrics({
      revenue: totalRevenue.toFixed(2)
    });
  }, [productInventory]);

  // Intervalo de auto-actualización
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);

      setTimeout(() => {
        if (promotion) {
          setProductInventory(generateProductInventory(promotion));
        }
        setLastUpdate(new Date());
        setIsRefreshing(false);
      }, 500);
    }, 60000);

    return () => clearInterval(interval);
  }, [promotion]);

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

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
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

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw 
              size={16} 
              className={isRefreshing ? 'animate-spin' : ''} 
            />
            <span>
              {isRefreshing ? 'Actualizando...' : `Última actualización: ${lastUpdate.toLocaleTimeString()}`}
            </span>
          </div>
        </div>

        {/* Ingresos totales */}
        <div className="grid gap-6 md:grid-cols-1 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Generados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isRefreshing ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <div className="text-2xl font-bold">
                  ${metrics.revenue}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                +8.3% vs. objetivo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de ganancias por producto */}
        {hasMetrics && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Ganancias por Producto</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isRefreshing ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)
              ) : (
                productInventory.map(product => (
                  <Card key={product.productId}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{product.productName}</CardTitle>
                      <CardDescription>Ingresos individuales</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">
                        ${product.revenue.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {product.unitsSold} unidades vendidas — ${product.unitPrice} c/u
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tabla de inventario */}
        <Card className="mb-8">
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
              <div className="text-center py-8 text-muted-foreground">No hay datos disponibles</div>
            ) : isRefreshing ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
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
                  {productInventory.map(item => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-right">{item.initialStock}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{item.unitsSold}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.finalStock}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.variation > 50 ? 'default' : 'outline'}>
                          {item.variation.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <Progress value={item.variation} className="w-24" />
                          <span className="text-xs text-muted-foreground">
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

        {/* Detalles y análisis */}
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
                <span className="text-muted-foreground">Ingresos Totales:</span>
                <span className="font-medium">${metrics.revenue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Productos Asociados:</span>
                <span className="font-medium">{productInventory.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unidades Vendidas Total:</span>
                <span className="font-medium">
                  {productInventory.reduce((s, i) => s + i.unitsSold, 0)}
                </span>
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

