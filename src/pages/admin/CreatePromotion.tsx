import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package, Loader2, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CREATE_PROMOTION,
  ASSOCIATE_PRODUCTS_TO_PROMOTION,
  GET_CATEGORIES,
  GET_PRODUCTS_BY_CATEGORY,
  GET_PROMOTIONS,
  type CategoriesResponse,
  type ProductsByCategoryResponse,
  type CreatePromotionResponse,
  type CreatePromotionInput,
} from '@/services/promotionService';
import { GET_CURRENT_USER, type CurrentUserResponse } from '@/services/authService';

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

const CreatePromotion = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<PromotionForm>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const { data: categoriesData, loading: categoriesLoading } = useQuery<CategoriesResponse>(GET_CATEGORIES);

  const { data: currentUserData, loading: userLoading } = useQuery<CurrentUserResponse>(GET_CURRENT_USER);

  const { data: productsData, loading: productsLoading } = useQuery<ProductsByCategoryResponse>(
    GET_PRODUCTS_BY_CATEGORY,
    {
      variables: { categoryId: selectedCategory || formData.category },
      skip: !selectedCategory && !formData.category,
    }
  );

  const [createPromotion, { loading: createLoading }] = useMutation<CreatePromotionResponse>(
    CREATE_PROMOTION,
    {
      refetchQueries: [{ query: GET_PROMOTIONS }],
      onCompleted: (data) => {
        if (selectedProducts.length > 0) {
          associateProducts({
            variables: {
              promotionId: data.createPromotion.promotionId,
              productIds: selectedProducts,
            },
          });
        } else {
          toast({
            title: "Promoción creada",
            description: "La promoción se ha creado exitosamente",
          });
          navigate('/admin/promotions');
        }
      },
      onError: (error) => {
        console.error('Error al crear promoción:', error);
        toast({
          title: "Error",
          description: error.message || "Ocurrió un error al crear la promoción",
          variant: "destructive",
        });
      },
    }
  );

  const [associateProducts, { loading: associateLoading }] = useMutation(
    ASSOCIATE_PRODUCTS_TO_PROMOTION,
    {
      refetchQueries: [{ query: GET_PROMOTIONS }],
      onCompleted: () => {
        const now = new Date();
        const dateStr = format(now, "dd 'de' MMMM 'de' yyyy", { locale: es });
        const timeStr = format(now, 'HH:mm:ss');
        
        toast({
          title: (
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span>¡La promoción ha sido activada con éxito!</span>
            </div>
          ) as any,
          description: (
            <div className="space-y-1 mt-2">
              <p className="font-medium">Fecha de activación: {dateStr}</p>
              <p className="font-medium">Hora de activación: {timeStr}</p>
              <p className="text-sm text-muted-foreground mt-2">Notificación para Administrador de Marketing</p>
            </div>
          ) as any,
        });
        navigate('/admin/promotions');
      },
      onError: (error) => {
        console.error('Error al asociar productos:', error);
        toast({
          title: "Advertencia",
          description: "La promoción se creó pero hubo un error al asociar algunos productos",
          variant: "destructive",
        });
        navigate('/admin/promotions');
      },
    }
  );

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
      if (!currentUserData?.currentUser?.userId) {
        toast({
          title: "Error",
          description: "No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        });
        return;
      }

      const input: CreatePromotionInput = {
        promotionName: formData.name || data.name,
        description: formData.description || data.description,
        startDate: formData.startDate || data.startDate,
        endDate: formData.endDate || data.endDate,
        discountPercentage: Number(formData.discount || data.discount),
        categoryId: Number(formData.category || data.category),
        statusId: "1",
        userId: Number(currentUserData.currentUser.userId),
      };

      await createPromotion({
        variables: { input },
      });
    } catch (error) {
      console.error('Error en onSubmit:', error);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const renderStep1 = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la promoción</Label>
        <Input
          id="name"
          defaultValue={formData.name}
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
            defaultValue={formData.startDate}
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
            defaultValue={formData.endDate}
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
          defaultValue={formData.description}
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
          {categoriesLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Select
              value={selectedCategory || formData.category}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setValue('category', value);
                setSelectedProducts([]);
              }}
            >
              <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categoriesData?.categories.map((category) => (
                  <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
            defaultValue={formData.discount}
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
          disabled={categoriesLoading || userLoading}
        >
          Siguiente
        </Button>
      </div>
    </form>
  );

  const renderStep2 = () => {
    const categoryProducts = productsData?.productsByCategory || [];

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
                Categoría: {categoriesData?.categories.find(c => c.categoryId.toString() === (formData.category || selectedCategory))?.categoryName}
              </p>
            </div>
          </div>

          {productsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
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

          {selectedProducts.length === 0 && !productsLoading && categoryProducts.length > 0 && (
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
            disabled={createLoading || associateLoading || selectedProducts.length === 0}
          >
            {(createLoading || associateLoading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">
              Crear Nueva Promoción - Paso {currentStep} de 2
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

export default CreatePromotion;