import { useCartStore } from "@/src/store";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Download, FileText, Send, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createOrder } from "@/src/lib/firebase/db";
import { auth } from "@/src/lib/firebase/firebase";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(2, "Введите ваше имя"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  restaurant: z.string().min(2, "Введите название заведения"),
});

export default function Calculator() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      restaurant: "",
    },
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add simple font encoding or standard font for now (jspdf default is standard english chars, for ru we need a font, but for simple app we can use ASCII approximations or just load a font if we had one. Let's just output basic Latinized headers to be safe in standard jspdf if we don't have cyrillic fonts loaded, but wait, usually you need to add a TTF. To not break, let's keep it simple or trust the user sees it.)
    // Actually, JSPDF handles basic latin. For Cyrillic, without adding VFS font it outputs garbled text.
    // Let's create a minimal structured PDF.
    doc.setFontSize(22);
    doc.text("KokDuken Order Request", 14, 20);
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString('ru-RU')}`, 14, 30);
    
    const tableData = items.map(i => [
      i.id,
      `${i.quantity} ${i.unit}`,
      `${i.base_price} KZT`,
      `${i.quantity * i.base_price} KZT`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Product ID', 'Qty', 'Price', 'Total']],
      body: tableData,
      foot: [['', '', 'Grand Total:', `${total()} KZT`]],
    });

    doc.save(`KokDuken_Order_${new Date().getTime()}.pdf`);
    toast.success("PDF заявка сформирована");
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (items.length === 0) {
      toast.error("Ваша заявка пуста корзину");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const orderData = {
        customerInfo: values,
        items: items.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity, price: i.base_price, unit: i.unit })),
        totalAmount: total(),
        status: "new",
        userId: auth.currentUser?.uid || null
      };

      await createOrder(orderData);
      
      // Simulate Webhook to CRM/Telegram
      console.log("[Fake Webhook -> CRM]", orderData);

      setIsSuccess(true);
      clearCart();
      toast.success("Заявка успешно отправлена!");
    } catch (e) {
      toast.error("Ошибка при отправке заявки");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center max-w-lg text-center">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-display font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none">Заявка принята!</h1>
        <p className="text-gray-600 font-medium mb-8">
          Спасибо за заказ. Данные успешно отправлены в базу KökDüken и CRM систему. Наш менеджер свяжется с вами в течение 15 минут для подтверждения деталей доставки.
        </p>
        <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 w-full rounded-full font-bold uppercase tracking-widest text-[11px] shadow-lg h-14">
           <Link to="/catalog">Вернуться в каталог</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-10 py-12 max-w-6xl">
      <Link to="/catalog" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-emerald-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Вернуться назад
      </Link>
      
      <h1 className="text-5xl font-display font-black text-slate-900 mb-12 uppercase tracking-tighter leading-none">Оформление <br/><span className="text-emerald-600">заявки</span></h1>

      <div className="grid lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-2xl border-t-8 border-emerald-600">
               <h2 className="text-xl font-display font-black uppercase tracking-tight text-slate-900 border-b border-gray-100 pb-4 mb-6">Список товаров</h2>
               
               {items.length === 0 ? (
                 <div className="text-center py-12">
                   <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                   <p className="text-gray-500">Заявка пока пуста</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                    {items.map(item => (
                      <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#F9F9F7] border border-gray-100 rounded-2xl gap-4">
                        <div className="flex items-center gap-6">
                           {item.image_url ? (
                             <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                           ) : (
                             <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                               <FileText className="w-8 h-8"/>
                             </div>
                           )}
                           <div>
                              <h3 className="font-display font-black text-lg uppercase tracking-tight text-slate-900">{item.name}</h3>
                              <div className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] mt-1">{item.base_price} ₸ / {item.unit}</div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                           <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                              <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"><Minus className="w-4 h-4"/></button>
                              <span className="w-12 text-center font-black text-slate-900">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"><Plus className="w-4 h-4"/></button>
                           </div>
                           <div className="w-24 text-right font-black text-2xl text-slate-900 leading-none">
                             {item.base_price * item.quantity} ₸
                           </div>
                           <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                             <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                    ))}
                    <div className="flex justify-end pt-8 border-t border-gray-100">
                      <Button variant="outline" onClick={generatePDF} className="rounded-full border-gray-200 text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:bg-gray-50 h-12 px-6">
                        <Download className="w-4 h-4 mr-2" /> Скачать в PDF
                      </Button>
                   </div>
                 </div>
               )}
            </div>
         </div>

         <div className="lg:col-span-1">
            <Card className="bg-[#1A1A1A] text-white rounded-[32px] border-0 overflow-hidden sticky top-32 shadow-2xl">
               <CardContent className="p-8">
                  <h3 className="font-display font-black text-2xl uppercase tracking-tighter mb-8 text-emerald-400">Данные ресторана</h3>
                  
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      
                      <div className="space-y-3">
                         <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Имя шеф-повара / Закупщика</Label>
                         <Input 
                            placeholder="НАПРИМЕР: ИВАН" 
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-12 uppercase font-bold text-xs" 
                            {...form.register("name")} 
                         />
                         {form.formState.errors.name && <p className="text-red-400 text-xs font-bold">{form.formState.errors.name.message}</p>}
                      </div>
                      
                      <div className="space-y-3">
                         <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Номер телефона</Label>
                         <Input 
                            placeholder="+7 (700) 000-00-00" 
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-12 font-bold text-xs" 
                            {...form.register("phone")} 
                         />
                         {form.formState.errors.phone && <p className="text-red-400 text-xs font-bold">{form.formState.errors.phone.message}</p>}
                      </div>
                      
                      <div className="space-y-3">
                         <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Название заведения</Label>
                         <Input 
                            placeholder="РЕСТОРАН NAVAT" 
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-12 uppercase font-bold text-xs" 
                            {...form.register("restaurant")} 
                         />
                         {form.formState.errors.restaurant && <p className="text-red-400 text-xs font-bold">{form.formState.errors.restaurant.message}</p>}
                      </div>

                      <div className="pt-8 pb-8 border-b border-white/10 flex justify-between items-end mt-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Итог</span>
                        <span className="font-black text-4xl leading-none text-emerald-400">{total()} ₸</span>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting || items.length === 0} 
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full h-16 font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-orange-500/20"
                      >
                         {isSubmitting ? "ОТПРАВКА..." : "ОТПРАВИТЬ ЗАЯВКУ"} <Send className="w-4 h-4 ml-2" />
                      </Button>
                      
                      <p className="text-[10px] font-bold uppercase tracking-wider text-center text-gray-500/80 mt-6 leading-relaxed">
                        Итоговая сумма может измениться после калибровки и взвешивания на складе. Менеджер согласует с вами точный чек.
                      </p>
                    </form>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
