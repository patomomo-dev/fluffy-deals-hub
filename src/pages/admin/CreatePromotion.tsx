import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { promotionService } from '@/services/promotionService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { promotionSchema, type PromotionFormData } from '@/lib/validators/promotionSchema';

const CreatePromotion = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState<PromotionFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
  });

  const selectedCategory = watch('category');
  const categories = promotionService.getCategories();
  const products = selectedCategory ? promotionService.getProductsByCategory(selectedCategory) : [];

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const handleNext = async (data: PromotionFormData) => {
    setFormData(data);
    setCurrentStep(2);
  };

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      promotionService.create({
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        category: formData.category,
        discount: formData.discount,
        productIds: selectedProducts
      });
      
      const activationDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });
      const activationTime = format(new Date(), "HH:mm:ss");
      
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <span>Notificación para Administrador de Marketing</span>
          </div>
        ) as any,
        description: (
          <div className="mt-2">
            <p className="font-semibold text-green-600">¡La promoción ha sido activada con éxito!</p>
            <p className="mt-1 text-sm">Fecha de activación: {activationDate}</p>
            <p className="text-sm">Hora de activación: {activationTime}</p>
          </div>
        ) as any,
      });
      
      navigate('/admin/promotions');
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/promotions')}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold">Crear Promoción - Paso {currentStep} de 2</h1>
        </div>

        {currentStep === 1 ? (
          <Card className="max-w-2xl">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(handleNext)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha inicio *</Label>
                    <Input id="startDate" type="date" {...register('startDate')} />
                    {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha fin *</Label>
                    <Input id="endDate" type="date" {...register('endDate')} />
                    {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea id="description" {...register('description')} rows={4} />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Descuento (%) *</Label>
                  <Input id="discount" type="number" min="1" max="100" {...register('discount', { valueAsNumber: true })} />
                  {errors.discount && <p className="text-sm text-destructive">{errors.discount.message}</p>}
                </div>

                <div className="flex gap-4 justify-end">
                  <Button type="button" variant="outline" onClick={() => navigate('/admin/promotions')}>Cancelar</Button>
                  <Button type="submit">Siguiente</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Selecciona productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => {
                    const isSelected = selectedProducts.includes(product.id);
                    return (
                      <Card key={product.id} className={`cursor-pointer ${isSelected ? 'border-primary ring-2 ring-primary' : ''}`} onClick={() => toggleProductSelection(product.id)}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox checked={isSelected} onClick={(e) => e.stopPropagation()} />
                            <div>
                              <h3 className="font-semibold text-sm">{product.name}</h3>
                              <p className="text-xs text-muted-foreground">{product.description}</p>
                              <p className="text-sm font-bold text-primary mt-2">${product.price}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Atrás</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : 'Guardar'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CreatePromotion;
