import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PromotionsList from "./pages/admin/PromotionsList";
import CreatePromotion from "./pages/admin/CreatePromotion";
import EditPromotion from "./pages/admin/EditPromotion";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin/promotions" element={<PromotionsList />} />
        <Route path="/admin/promotions/create" element={<CreatePromotion />} />
        <Route path="/admin/promotions/:id/edit" element={<EditPromotion />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
