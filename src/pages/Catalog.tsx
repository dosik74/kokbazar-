import { useEffect, useState, useMemo } from "react";
import { getCategories, getProducts, Category, Product } from "@/src/lib/firebase/db";
import { useCartStore } from "@/src/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Plus, Minus, Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Catalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const cart = useCartStore();

  useEffect(() => {
    Promise.all([getCategories(), getProducts()])
      .then(([cats, prods]) => {
        setCategories(cats);
        // Seasonal boosting: get current month (1-12)
        const currentMonth = new Date().getMonth() + 1;
        
        const sortedProds = [...prods].sort((a, b) => {
           const aSeasonal = a.season_months?.includes(currentMonth) ? 1 : 0;
           const bSeasonal = b.season_months?.includes(currentMonth) ? 1 : 0;
           if (aSeasonal !== bSeasonal) return bSeasonal - aSeasonal;
           
           const aHit = a.tags?.includes("хит") ? 1 : 0;
           const bHit = b.tags?.includes("хит") ? 1 : 0;
           if (aHit !== bHit) return bHit - aHit;
           
           return a.sort_weight - b.sort_weight;
        });
        
        setProducts(sortedProds);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === "all" || p.category_id === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.name_kz && p.name_kz.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, search]);

  const handleAddToCart = (product: Product) => {
    cart.addItem(product, 1);
    toast.success(`${product.name} добавлено в заявку`, { duration: 2000 });
  };

  const getQuantity = (id: string) => {
    return cart.items.find(i => i.id === id)?.quantity || 0;
  }

  const updateQty = (product: Product, delta: number) => {
     const qty = getQuantity(product.id) + delta;
     if (qty <= 0) {
        cart.removeItem(product.id);
     } else {
        cart.updateQuantity(product.id, qty);
     }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 border-b border-gray-200 pb-8">
          <div>
            <h1 className="text-5xl font-display font-black text-slate-900 uppercase tracking-tighter leading-none">Каталог <br/><span className="text-emerald-600">свежего</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-4">Оптовые поставки для HoReCa Алматы. Цены актуальны на сегодня.</p>
          </div>
          <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 rounded-full h-14 px-8 text-sm font-bold uppercase tracking-widest shadow-lg">
             <Link to="/calculator">
               <ShoppingCart className="mr-2 w-5 h-5"/>
               Перейти к заявке ({cart.items.reduce((a,b)=>a+b.quantity, 0)})
             </Link>
          </Button>
       </div>

       <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                   placeholder="ПОИСК..." 
                   className="pl-12 bg-white rounded-full border-gray-200 h-12 font-bold text-xs uppercase tracking-widest"
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                />
             </div>
             
             <div className="bg-white rounded-3xl p-6 shadow-xl border-t-4 border-emerald-600">
               <h3 className="font-display font-black text-xl uppercase tracking-tight text-slate-900 mb-4">Категории</h3>
               <div className="space-y-1">
                 <button 
                    onClick={() => setActiveCategory("all")}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeCategory === "all" ? "bg-emerald-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100/50 hover:text-slate-900"}`}
                 >
                   Все товары
                 </button>
                 {categories.map(c => (
                   <button 
                      key={c.id}
                      onClick={() => setActiveCategory(c.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeCategory === c.id ? "bg-emerald-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100/50 hover:text-slate-900"}`}
                   >
                     {c.name}
                   </button>
                 ))}
               </div>
             </div>
          </aside>

          {/* Grid */}
          <main className="flex-1">
             {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
                   {[1,2,3,4,5,6,7,8].map(i => (
                     <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4]" />
                   ))}
                </div>
             ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                     {filteredProducts.map(p => {
                       const qty = getQuantity(p.id);
                       return (
                         <motion.div 
                           layout
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           transition={{ duration: 0.2 }}
                           key={p.id}
                         >
                           <Card className="h-full overflow-hidden rounded-[24px] border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col bg-white hover:-translate-y-1">
                              <div className="aspect-square bg-gray-50 relative overflow-hidden group">
                                 <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                                    {p.tags?.includes("хит") && <Badge className="bg-orange-500 hover:bg-orange-500 border-0 shadow-sm font-bold uppercase tracking-widest text-[9px] px-2 py-0.5">ХИТ</Badge>}
                                    {p.tags?.includes("акция") && <Badge className="bg-red-500 hover:bg-red-500 border-0 shadow-sm font-bold uppercase tracking-widest text-[9px] px-2 py-0.5">АКЦИЯ</Badge>}
                                    {p.tags?.includes("сезонка") && <Badge className="bg-emerald-500 hover:bg-emerald-500 border-0 shadow-sm font-bold uppercase tracking-widest text-[9px] px-2 py-0.5">СЕЗОН</Badge>}
                                 </div>
                                 {p.image_url ? (
                                   <img src={p.image_url} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                 ) : (
                                   <div className="w-full h-full flex items-center justify-center text-emerald-200">
                                      <Leaf className="w-12 h-12 opacity-50" />
                                   </div>
                                 )}
                              </div>
                              <CardContent className="p-5 flex flex-col flex-1">
                                <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">{categories.find(c => c.id === p.category_id)?.name}</div>
                                <h3 className="font-display font-black text-lg uppercase tracking-tight text-slate-900 leading-none mb-4" title={p.name}>{p.name}</h3>
                                <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-4">
                                  <div className="flex justify-between items-end">
                                    <span className="font-black text-2xl text-emerald-600 leading-none">{p.base_price} ₸<span className="text-xs text-gray-400 font-bold uppercase ml-1">/{p.unit}</span></span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-sm">{p.stock_status}</span>
                                  </div>
                                  
                                  {qty > 0 ? (
                                     <div className="flex items-center justify-between bg-[#F9F9F7] rounded-xl p-1 shadow-inner border border-gray-200">
                                        <button onClick={()=>updateQty(p, -1)} className="w-10 h-10 flex items-center justify-center text-emerald-600 bg-white rounded-lg shadow-sm hover:bg-emerald-50"><Minus className="w-4 h-4"/></button>
                                        <span className="font-black text-slate-900 w-12 text-center text-sm">{qty} {p.unit}</span>
                                        <button onClick={()=>updateQty(p, 1)} className="w-10 h-10 flex items-center justify-center text-emerald-600 bg-white rounded-lg shadow-sm hover:bg-emerald-50"><Plus className="w-4 h-4"/></button>
                                     </div>
                                  ) : (
                                     <Button 
                                       onClick={() => handleAddToCart(p)}
                                       className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-widest text-[11px] shadow-lg h-12 transition-all hover:shadow-orange-500/30"
                                     >
                                       В заявку
                                     </Button>
                                  )}
                                </div>
                              </CardContent>
                           </Card>
                         </motion.div>
                       );
                     })}
                  </AnimatePresence>
                </div>
             )}
             
             {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                   <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Search className="w-8 h-8 text-gray-400" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">Ничего не найдено</h3>
                   <p className="text-gray-500">Попробуйте изменить параметры поиска или категорию</p>
                </div>
             )}
          </main>
       </div>
    </div>
  );
}
