import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, RefreshCw, Package, DollarSign, BarChart3, AlertCircle, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation } from '@apollo/client/react';
import { useState } from 'react';
import {
  GET_PROMOTION_PERFORMANCE,
  CHECK_PROMOTION_HAS_METRICS,
  INITIALIZE_PROMOTION_METRICS,
  SIMULATE_METRICS_UPDATE,
  GET_PROMOTIONS,
  type PromotionPerformanceResponse,
  type PromotionHasMetricsResponse,
  type InitializeMetricsResponse,
  type SimulateMetricsResponse,
  type PromotionsResponse
} from '@/services/promotionService';

const PromotionMetrics = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Estados para simulación de ventas
  const [isSimulateDialogOpen, setIsSimulateDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [unitsSoldInput, setUnitsSoldInput] = useState<string>('10');

  // Query para obtener la promoción básica (siempre funciona)
  const { data: promotionsData, loading: loadingPromotions } = useQuery<PromotionsResponse>(GET_PROMOTIONS, {
    skip: !id
  });

  // Query para verificar si hay métricas
  const { data: hasMetricsData, loading: checkingMetrics } = useQuery<PromotionHasMetricsResponse>(
    CHECK_PROMOTION_HAS_METRICS,
    {
      variables: { promotionId: id },
      skip: !id,
      fetchPolicy: 'network-only'
    }
  );

  // Query principal de métricas - solo se ejecuta si hay métricas
  const { data, loading, error, refetch } = useQuery<PromotionPerformanceResponse>(
    GET_PROMOTION_PERFORMANCE,
    {
      variables: { promotionId: id },
      skip: !id || !hasMetricsData?.promotionHasMetrics,
      pollInterval: hasMetricsData?.promotionHasMetrics ? 60000 : 0,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only'
    }
  );

  // Mutation para inicializar métricas
  const [initializeMetrics, { loading: initializing }] = useMutation<InitializeMetricsResponse>(
    INITIALIZE_PROMOTION_METRICS,
    {
      variables: { promotionId: id },
      onCompleted: (data) => {
        if (data.initializePromotionMetrics) {
          setTimeout(() => {
            refetch();
          }, 500);
        }
      },
      onError: (err) => console.error('Error inicializando métricas:', err)
    }
  );

  // Mutation para simular actualización de ventas
  const [simulateUpdate, { loading: simulating }] = useMutation<SimulateMetricsResponse>(
    SIMULATE_METRICS_UPDATE,
    {
      onCompleted: () => {
        globalThis.location.reload();
      },
      onError: (err) => console.error('Error simulando ventas:', err)
    }
  );

  const promotion = promotionsData?.promotions.find(p => p.promotionId === id);
  const performance = data?.promotionPerformance;
  const hasMetrics = hasMetricsData?.promotionHasMetrics ?? false;
  
  const isLoading = loading || checkingMetrics || loadingPromotions;

  const handleRefresh = async () => {
    await refetch();
  };

  const handleInitializeMetrics = async () => {
    await initializeMetrics();
  };

  const handleSimulateUpdate = async () => {
    if (!selectedProductId || !unitsSoldInput || !id) return;

    const unitsSold = parseInt(unitsSoldInput);
    if (isNaN(unitsSold) || unitsSold <= 0) {
      alert('Por favor ingresa un número válido de unidades');
      return;
    }

    await simulateUpdate({
      variables: {
        promotionId: id,
        productId: selectedProductId,
        unitsSold
      }
    });
  };

  // Estado de carga inicial - AHORA incluye loadingPromotions
  if (isLoading && !promotion) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="mb-6 flex items-center gap-4">
            <Skeleton className="h-10 w-24" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  if (!promotion && !loadingPromotions) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-xl font-semibold mb-2">Promoción no encontrada</p>
            <p className="text-muted-foreground mb-6">
              No se pudo encontrar la promoción con ID: {id}
            </p>
            <Button onClick={() => navigate('/admin/promotions')}>
              Volver a Promociones
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  // Error grave al cargar métricas (no por falta de inicialización)
  if (error && hasMetrics) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error al cargar métricas</AlertTitle>
            <AlertDescription>
              {error.message}
              <Button variant="outline" size="sm" className="ml-4" onClick={() => refetch()}>
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/admin/promotions')} className="mt-4">
            Volver a Promociones
          </Button>
        </div>
      </Layout>
    );
  }

  // Métricas no inicializadas - Mostrar vista elegante
  if (!hasMetrics || !performance) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          {/* Header con info de la promoción */}
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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-primary">{promotion?.promotionName}</h1>
                <Badge variant="secondary">
                  {promotion?.status.statusName}
                </Badge>
              </div>
              <p className="text-muted-foreground">{promotion?.description || 'Métricas de rendimiento'}</p>
            </div>
          </div>

          {/* Información de la promoción sin métricas */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Descuento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{promotion?.discountPercentage}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{promotion?.category.categoryName}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Productos Asociados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{promotion?.products?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Card principal para inicializar métricas */}
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <BarChart3 className="h-10 w-10 text-muted-foreground" />
              </div>

              <h2 className="text-2xl font-bold mb-2">Métricas no inicializadas</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Esta promoción aún no tiene métricas de rendimiento. Inicializa las métricas para comenzar a rastrear
                el inventario, ventas e ingresos de los productos asociados.
              </p>

              <Alert className="mb-6 max-w-2xl mx-auto">
                <Info className="h-4 w-4" />
                <AlertTitle>¿Deseas inicializar las métricas?</AlertTitle>
                <AlertDescription>
                  Al inicializar, se capturará el inventario actual de los productos asociados como punto de partida.
                  Asegúrate de que hayas asociado los productos correctos a esta promoción.
                </AlertDescription>
                <DialogFooter className="mt-3 italic">
                  Esta es una simulación
                </DialogFooter>
              </Alert>

              <Button
                size="lg"
                onClick={handleInitializeMetrics}
                disabled={initializing || promotion?.products?.length === 0}
                className="gap-2"
              >
                {initializing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Inicializando métricas...
                  </>
                ) : (
                  <>
                    Inicializar Métricas
                  </>
                )}
              </Button>

              {promotion?.products?.length === 0 && (
                <p className="text-sm text-muted-foreground mt-4">
                  Debes asociar al menos un producto a esta promoción antes de inicializar las métricas.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Mostrar productos asociados si existen */}
          {promotion?.products && promotion.products.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Productos Asociados</CardTitle>
                <CardDescription>
                  Estos productos tendrán métricas una vez inicialices el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Precio Base</TableHead>
                      <TableHead className="text-right">Precio con Descuento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotion.products.map(product => {
                      const discountedPrice = product.basePrice * (1 - promotion.discountPercentage / 100);
                      return (
                        <TableRow key={product.productId}>
                          <TableCell className="font-medium">{product.productName}</TableCell>
                          <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                          <TableCell className="text-right">${product.basePrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            ${discountedPrice.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    );
  }

  // Vista normal con métricas inicializadas
  const productMetrics = performance.productMetrics || [];

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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-primary">{performance.promotionName}</h1>
                <Badge variant={performance.isActive ? 'default' : 'secondary'}>
                  {performance.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {performance.promotionDescription || 'Métricas de rendimiento'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground text-right">
              {performance.lastUpdated && (
                <span>Última actualización: {new Date(performance.lastUpdated).toLocaleString()}</span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </Button>
            {/* Botón de simulación */}
            <Dialog open={isSimulateDialogOpen} onOpenChange={setIsSimulateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  Simular Venta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Simular Actualización de Ventas</DialogTitle>
                  <DialogDescription>
                    Simula la venta de unidades de un producto para actualizar las métricas en tiempo real.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="product-select">Producto</Label>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger id="product-select">
                        <SelectValue placeholder="Selecciona un producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {productMetrics.map(product => (
                          <SelectItem key={product.productId} value={product.productId}>
                            {product.productName} (SKU: {product.productSku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="units-sold">Unidades a vender</Label>
                    <Input
                      id="units-sold"
                      type="number"
                      min="1"
                      value={unitsSoldInput}
                      onChange={(e) => setUnitsSoldInput(e.target.value)}
                      placeholder="Ej: 10"
                    />
                    {selectedProductId && (
                      <p className="text-xs text-muted-foreground">
                        Inventario actual: {
                          productMetrics.find(p => p.productId === selectedProductId)?.currentInventory || 0
                        } unidades
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsSimulateDialogOpen(false)}
                    disabled={simulating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSimulateUpdate}
                    disabled={!selectedProductId || simulating}
                  >
                    {simulating ? 'Simulando...' : 'Simular Venta'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPIs principales */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${performance.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {performance.discountPercentage}% de descuento aplicado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unidades Vendidas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance.totalUnitsSold}</div>
              <p className="text-xs text-muted-foreground">
                De {performance.totalProducts} productos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reducción Inventario</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance.inventoryReductionPercentage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {performance.totalInventoryDifference} unidades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Variación SKU Promedio</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performance.averageSkuVariationPercentage?.toFixed(1) ?? '0.0'}%
              </div>
              <p className="text-xs text-muted-foreground">
                Inventario inicial: {performance.totalInitialInventory}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de ganancias por producto */}
        {productMetrics.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Ganancias por Producto</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {productMetrics.map(product => (
                <Card key={product.productId}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{product.productName}</CardTitle>
                    <CardDescription>
                      SKU: {product.productSku} • {product.category.categoryName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      ${product.revenueGenerated.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {product.unitsSold} unidades — ${product.discountedPrice.toFixed(2)} c/u
                      <span className="line-through ml-2 opacity-60">${product.basePrice.toFixed(2)}</span>
                    </p>
                    <div className="mt-3 pt-3 border-t space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Stock actual:</span>
                        <span className="font-medium">{product.currentInventory}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Stock inicial:</span>
                        <span className="font-medium">{product.initialInventory}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Variación SKU:</span>
                        <Badge variant="outline" className="text-xs">
                          {product.skuVariationPercentage?.toFixed(1) ?? '0.0'}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tabla de inventario */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Variación de Inventario de Productos</CardTitle>
            <CardDescription>
              {productMetrics.length > 0
                ? 'Cantidad inicial, final y diferencia por producto asociado'
                : 'No hay productos asociados a esta promoción'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {productMetrics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay datos disponibles
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Precio Base</TableHead>
                    <TableHead className="text-right">Precio c/ Descuento</TableHead>
                    <TableHead className="text-right">Stock Inicial</TableHead>
                    <TableHead className="text-right">Unidades Vendidas</TableHead>
                    <TableHead className="text-right">Stock Actual</TableHead>
                    <TableHead className="text-right">Reducción</TableHead>
                    <TableHead className="text-right">Progreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productMetrics.map(item => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-muted-foreground">{item.productSku}</TableCell>
                      <TableCell className="text-right">
                        <span className="line-through opacity-60">${item.basePrice.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ${item.discountedPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">{item.initialInventory}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{item.unitsSold}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.currentInventory}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.inventoryReductionPercentage > 50 ? 'default' : 'outline'}>
                          {item.inventoryReductionPercentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <Progress value={item.inventoryReductionPercentage} className="w-24" />
                          <span className="text-xs text-muted-foreground w-10">
                            {item.inventoryReductionPercentage.toFixed(0)}%
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
                <span className="font-medium">{performance.discountPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha Inicio:</span>
                <span className="font-medium">{new Date(performance.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha Fin:</span>
                <span className="font-medium">{new Date(performance.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant={performance.isActive ? 'default' : 'secondary'}>
                  {performance.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Productos:</span>
                <span className="font-medium">{performance.totalProducts}</span>
              </div>
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
                <span className="font-medium">${performance.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unidades Vendidas:</span>
                <span className="font-medium">{performance.totalUnitsSold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inventario Inicial:</span>
                <span className="font-medium">{performance.totalInitialInventory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inventario Actual:</span>
                <span className="font-medium">{performance.totalCurrentInventory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desempeño:</span>
                <Badge variant={performance.inventoryReductionPercentage > 30 ? 'default' : 'outline'}>
                  {performance.inventoryReductionPercentage > 50 ? 'Excelente' :
                    performance.inventoryReductionPercentage > 30 ? 'Bueno' : 'Regular'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PromotionMetrics;