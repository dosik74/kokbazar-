import { ArrowRight, Leaf, Truck, Clock, ShieldCheck, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getProducts, Product } from "@/src/lib/firebase/db";
import { useCartStore } from "@/src/store";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

const TRUSTED_LOGOS = [
  "RITZ-CARLTON", "NAVAT", "RUMI", "SANDAQ", "DEL PAPA", "AURA", "RAW", "MANGA", "OLIVIER"
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    getProducts().then(all => {
      // shuffle and get some random for feature showcase
      const shuffled = [...all].sort(() => 0.5 - Math.random());
      setFeatured(shuffled.slice(0, 6));
    }).catch(console.error);
  }, []);

  const downloadPriceList = async () => {
    try {
      const allProducts = await getProducts();
      const response = await fetch("/api/generate-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: allProducts })
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "KokDuken_Price.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Прайс-лист успешно скачан");
    } catch {
      toast.error("Не удалось скачать прайс-лист");
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-32 overflow-hidden px-10">
        <div className="container mx-auto max-w-7xl relative z-10 grid md:grid-cols-12 gap-6 items-end">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-8 flex flex-col items-start gap-0"
          >
            <h1 className="text-6xl md:text-[80px] lg:text-[110px] leading-[0.85] font-display font-black uppercase tracking-tighter text-emerald-600 mb-8 mt-12 md:mt-0">
              Свежесть<br/>
              <span className="text-orange-500">для лучших</span><br/>
              кухонь
            </h1>
            <p className="text-xl max-w-lg font-medium text-gray-600 leading-snug border-l-4 border-emerald-600 pl-6 mb-8 mt-4">
              Прямые поставки овощей и фруктов в рестораны Алматы.<br/>
              <span className="text-slate-900 font-bold">Сборка заказа за 2 часа. Доставка 24/7.</span>
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full h-14 px-8 text-sm font-bold uppercase tracking-widest shadow-lg">
                <Link to="/catalog">Собрать заявку <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button variant="outline" size="lg" onClick={downloadPriceList} className="rounded-full h-14 px-8 text-sm font-bold uppercase tracking-widest border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                <Download className="mr-2 w-5 h-5" /> Скачать прайс
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="col-span-4 flex flex-col gap-4 relative hidden md:flex"
          >
            <div className="bg-white p-6 rounded-[32px] shadow-2xl border-t-8 border-emerald-600 relative overflow-hidden group">
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="bg-orange-100/80 backdrop-blur text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Хит сезона</span>
                  <span className="text-emerald-600 font-black tracking-tight">₸ 850/кг</span>
               </div>
               <div className="h-40 rounded-2xl mb-4 overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop" alt="Томаты" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
               </div>
               <h3 className="text-xl font-display font-black uppercase tracking-tight leading-none mb-1 text-slate-900">Томаты Черри</h3>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Тепличные • Алматы</p>
            </div>
            
            <div className="bg-emerald-600 p-6 rounded-[32px] text-white flex flex-col justify-center min-h-[140px] shadow-xl">
               <p className="text-5xl font-display font-black mb-1 leading-none tracking-tighter">340+</p>
               <p className="text-xs uppercase tracking-widest opacity-70 font-bold text-emerald-100">Позиций в наличии сегодня</p>
            </div>
          </motion.div>
        </div>

        {/* Trust Block */}
        <div className="container mx-auto max-w-7xl mt-24">
           <p className="text-[10px] font-display font-black uppercase tracking-[0.3em] text-gray-400 mb-6 px-2">Нам доверяют лучшие кухни Алматы</p>
           <div className="flex overflow-hidden relative opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              <motion.div 
                 animate={{ x: ["0%", "-50%"] }}
                 transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                 className="flex whitespace-nowrap gap-16 px-2 items-center"
              >
                 {[...TRUSTED_LOGOS, ...TRUSTED_LOGOS, ...TRUSTED_LOGOS].map((logo, i) => (
                   <span key={i} className="font-display font-black text-2xl md:text-3xl text-slate-900 uppercase tracking-tighter">
                      {logo}
                   </span>
                 ))}
              </motion.div>
           </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-white px-10 rounded-[3rem] shadow-2xl mx-4 md:mx-10 mb-24 z-10 relative">
        <div className="container mx-auto max-w-6xl">
           <div className="mb-16">
             <h2 className="text-5xl font-display font-black text-slate-900 mb-6 uppercase tracking-tighter leading-none">Почему шеф-повара <br/><span className="text-emerald-600">выбирают закуп</span> в KökDüken</h2>
             <p className="text-lg text-gray-600 max-w-2xl font-medium">Мы понимаем ритм ресторана и берем головную боль с постоянным поиском качественных овощей на себя.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Clock className="w-8 h-8"/>, title: "Работаем 24/7", desc: "Принимаем ночные заявки от су-шефов. К утренней смене продукты уже на кухне." },
                { icon: <ShieldCheck className="w-8 h-8"/>, title: "Строгий отбор", desc: "Никакой гнили и нестандарта. Фасуем и калибруем овощи вручную под каждый заказ." },
                { icon: <Truck className="w-8 h-8"/>, title: "Собственная логистика", desc: "Рефрижераторы поддерживают правильную температуру, зелень приезжает хрустящей." },
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-[2rem] bg-[#F9F9F7] border border-gray-100 flex flex-col items-start gap-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-lg">
                    {f.icon}
                  </div>
                  <h3 className="font-display font-black text-2xl uppercase tracking-tight text-slate-900 mt-4">{f.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Dynamic Catalog Preview */}
      <section className="pb-32 bg-[#F9F9F7] px-10">
         <div className="container mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
               <div>
                  <h2 className="text-6xl font-display font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none">Идеально <br/><span className="text-emerald-600">свежее</span></h2>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Сегодня на витрине — актуальные позиции для меню</p>
               </div>
               <Button asChild variant="outline" className="rounded-full h-12 px-8 font-bold uppercase tracking-widest text-xs border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors">
                 <Link to="/catalog">Смотреть весь прайс</Link>
               </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
               {featured.map(product => (
                 <Card key={product.id} className="overflow-hidden rounded-2xl border-0 shadow-sm hover:shadow-xl transition-shadow group flex flex-col cursor-pointer bg-white">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                       {product.tags?.includes("хит") && (
                         <Badge className="absolute top-2 left-2 z-10 bg-orange-500 hover:bg-orange-500 border-0">ХИТ</Badge>
                       )}
                       {product.tags?.includes("акция") && (
                         <Badge className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-500 border-0">АКЦИЯ</Badge>
                       )}
                       {product.image_url ? (
                         <img src={product.image_url} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-200">
                            <Leaf className="w-12 h-12 opacity-50" />
                         </div>
                       )}
                    </div>
                    <CardContent className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1 line-clamp-2" title={product.name}>{product.name}</h3>
                      <div className="mt-auto pt-3 flex justify-between items-center">
                        <span className="font-black text-emerald-700">{product.base_price} ₸<span className="text-xs text-gray-400 font-normal">/{product.unit}</span></span>
                      </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
            
         </div>
      </section>

    </div>
  );
}
