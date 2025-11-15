import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package } from 'lucide-react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import {
  GET_PROMOTIONS,
  UPDATE_PROMOTION,
  ASSOCIATE_PRODUCTS_TO_PROMOTION,
  REMOVE_PRODUCTS_FROM_PROMOTION,
  GET_CATEGORIES,
  GET_PRODUCTS_BY_CATEGORY,
  PromotionsResponse,
  UpdatePromotionResponse,
  UpdatePromotionInput,
  CategoriesResponse,
  ProductsByCategoryResponse
} from '@/services/promotionService';

const promotionSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  category: z.string().min(1, 'Categoría requerida'),
  discount: z.coerce.number().min(1, 'Descuento debe ser mayor a 0').max(100, 'Descuento no puede ser mayor a 100'),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().min(1, 'Fecha de fin requerida'),
}).refine((data) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(data.startDate + 'T00:00:00');
  startDate.setHours(0, 0, 0, 0);
  return startDate >= today;
}, {
  message: 'La fecha de inicio no puede ser anterior a hoy',
  path: ['startDate'],
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: 'La fecha de fin debe ser igual o posterior a la fecha de inicio',
  path: ['endDate'],
});

type PromotionForm = z.infer<typeof promotionSchema>;

const EditPromotion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [initialProducts, setInitialProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<PromotionForm>>({});
  const { data: promotionsData, loading: isLoadingPromotions } = useQuery<PromotionsResponse>(GET_PROMOTIONS);
  const { data: categoriesData, loading: isLoadingCategories } = useQuery<CategoriesResponse>(GET_CATEGORIES);

  const [getProductsByCategory, { data: productsData, loading: isLoadingProducts }] =
    useLazyQuery<ProductsByCategoryResponse>(GET_PRODUCTS_BY_CATEGORY);

  const [updatePromotionMutation, { loading: updating }] = useMutation<UpdatePromotionResponse>(UPDATE_PROMOTION);
  const [associateProductsMutation] = useMutation(ASSOCIATE_PRODUCTS_TO_PROMOTION);
  const [removeProductsMutation] = useMutation(REMOVE_PRODUCTS_FROM_PROMOTION);

  const promotion = promotionsData?.promotions?.find((p) => p.promotionId === id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    getValues,
  } = useForm<PromotionForm>({
    resolver: zodResolver(promotionSchema),
  });

  useEffect(() => {
    if (isLoadingPromotions) return;

    if (promotion) {
      setValue('name', promotion.promotionName);
      setValue('description', promotion.description);
      setValue('category', promotion.category.categoryId.toString());
      setValue('discount', promotion.discountPercentage);
      setValue('startDate', promotion.startDate.split('T')[0]);
      setValue('endDate', promotion.endDate.split('T')[0]);

      const categoryId = promotion.category.categoryId;
      setSelectedCategory(categoryId.toString());

      getProductsByCategory({
        variables: { categoryId: categoryId }
      });

      if (promotion.products && promotion.products.length > 0) {
        const productIds = promotion.products.map((p) => p.productId.toString());
        setSelectedProducts(productIds);
        setInitialProducts(productIds);
      }

    } else if (id && promotionsData?.promotions) {
      toast({
        title: "Promoción no encontrada",
        variant: "destructive",
      });
      navigate('/admin/promotions');
    }
  }, [promotion, id, navigate, setValue, toast, isLoadingPromotions, promotionsData, getProductsByCategory]);

  const handleNextStep = async () => {
    const isValid = await trigger(['name', 'description', 'category', 'discount', 'startDate', 'endDate']);
    if (isValid) {
      const currentData = getValues();
      setFormData(currentData);
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const onSubmit = async (data: PromotionForm) => {
    if (currentStep === 1) {
      handleNextStep();
      return;
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un producto",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentFormData = getValues();

      const input: UpdatePromotionInput = {
        promotionName: currentFormData.name,
        description: currentFormData.description,
        categoryId: parseInt(currentFormData.category),
        discountPercentage: Number(currentFormData.discount),
        startDate: currentFormData.startDate,
        endDate: currentFormData.endDate,
        statusId: promotion?.status.statusId || '1',
        userId: promotion?.user.userId ? Number(promotion.user.userId) : undefined
      };

      await updatePromotionMutation({
        variables: {
          id: id,
          input: input
        }
      });

      const removedProducts = initialProducts.filter(
        (initialId) => !selectedProducts.includes(initialId)
      );

      if (removedProducts.length > 0) {
        await removeProductsMutation({
          variables: {
            promotionId: id,
            productIds: removedProducts
          }
        });
      }

      await associateProductsMutation({
        variables: {
          promotionId: id,
          productIds: selectedProducts
        },
        refetchQueries: [{ query: GET_PROMOTIONS }],
      });

      toast({
        title: "Promoción actualizada",
        description: "La promoción se ha actualizado exitosamente",
      });

      navigate('/admin/promotions');

    } catch (error) {
      console.error('Error updating promotion:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar la promoción",
        variant: "destructive",
      });
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setValue('category', value);
    setSelectedProducts([]);

    getProductsByCategory({
      variables: { categoryId: value }
    });
  };

  const renderStep1 = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la promoción</Label>
        <Input
          id="name"
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha de inicio</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
            className={errors.startDate ? 'border-destructive' : ''}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha de fin</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}
            className={errors.endDate ? 'border-destructive' : ''}
          />
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          rows={4}
          {...register('description')}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select
            value={selectedCategory}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingCategories ? (
                <SelectItem value="loading" disabled>Cargando...</SelectItem>
              ) : (
                categoriesData?.categories?.map((category) => (
                  <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                    {category.categoryName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount">Porcentaje de descuento</Label>
          <Input
            id="discount"
            type="number"
            min="1"
            max="100"
            {...register('discount')}
            className={errors.discount ? 'border-destructive' : ''}
          />
          {errors.discount && (
            <p className="text-sm text-destructive">{errors.discount.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="cancel"
          className="flex-1"
          onClick={() => navigate('/admin/promotions')}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1"
        >
          Siguiente
        </Button>
      </div>
    </form>
  );

  const renderStep2 = () => {
    const categoryProducts = productsData?.productsByCategory || [];
    const selectedCategoryName = categoriesData?.categories?.find(
      c => c.categoryId.toString() === selectedCategory
    )?.categoryName;

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePreviousStep}
              className="p-2"
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h3 className="text-lg font-semibold text-primary">Seleccionar Productos</h3>
              <p className="text-sm text-muted-foreground">
                Categoría: {selectedCategoryName || 'Cargando...'}
              </p>
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando productos...</p>
            </div>
          ) : categoryProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay productos disponibles en esta categoría</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {categoryProducts.map((product) => (
                <Card
                  key={product.productId}
                  className={`p-4 cursor-pointer transition-colors ${selectedProducts.includes(product.productId.toString())
                    ? 'bg-accent border-primary'
                    : 'hover:bg-accent/50'
                    }`}
                  onClick={() => toggleProductSelection(product.productId.toString())}
                >
                  <div className="flex items-center gap-3">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedProducts.includes(product.productId.toString())}
                        onCheckedChange={() => toggleProductSelection(product.productId.toString())}
                        className="h-5 w-5"
                      />
                    </div>
                    <Package size={20} className="text-muted-foreground" />
                    <div className="flex-1">
                      <h4 className="font-medium">{product.productName}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${product.basePrice.toFixed(2)} - SKU: {product.sku}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {selectedProducts.length === 0 && !isLoadingProducts && categoryProducts.length > 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Selecciona al menos un producto para continuar
            </p>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="cancel"
            className="flex-1"
            onClick={handlePreviousStep}
          >
            Anterior
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={updating || selectedProducts.length === 0}
          >
            {updating ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    );
  };

  if (isLoadingPromotions || isLoadingCategories) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <Card className="max-w-2xl mx-auto p-12 text-center">
            <p className="text-muted-foreground">Cargando...</p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!promotion && !isLoadingPromotions) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">
              Editar Promoción - Paso {currentStep} de 2
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 ? renderStep1() : renderStep2()}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditPromotion;