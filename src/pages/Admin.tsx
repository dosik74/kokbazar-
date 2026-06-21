import { useEffect, useState } from "react";
import { auth, googleProvider } from "@/src/lib/firebase/firebase";
import { signInWithPopup, User } from "firebase/auth";
import { getProducts, updateProduct, Product } from "@/src/lib/firebase/db";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ImagePlus, RefreshCw, Save, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Gemini state
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        // Assume all authenticated users for this demo can view admin, but 
        // real rules would check roles
        fetchData();
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchData = async () => {
    try {
      const p = await getProducts();
      setProducts(p.sort((a,b) => a.name.localeCompare(b.name)));
    } catch(e: any) {
      toast.error(e.message || "Ошибка доступа");
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const saveProduct = async (id: string, field: keyof Product, value: any) => {
    try {
      await updateProduct(id, { [field]: value });
      toast.success("Сохранено");
      setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    } catch(e) {
      toast.error("Ошибка сохранения (недостаточно прав?)");
    }
  }

  const generateImage = async (product: Product) => {
    if (!prompt) {
      toast.error("Введите промпт");
      return;
    }
    setGeneratingImageId(product.id);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      await saveProduct(product.id, "image_url", data.imageUrl);
      toast.success("Изображение успешно сгенерировано!");
    } catch (e: any) {
      toast.error(e.message || "Ошибка генерации");
    } finally {
      setGeneratingImageId(null);
    }
  }

  if (!user && !loading) {
     return (
       <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center max-w-md">
         <ShieldAlert className="w-16 h-16 text-orange-500 mb-6" />
         <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-slate-900 mb-4">Доступ запрещен</h1>
         <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">Для доступа к административной панели требуется авторизация.</p>
         <Button onClick={handleLogin} size="lg" className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 uppercase tracking-widest font-bold text-xs h-14">Войти</Button>
       </div>
     )
  }

  return (
    <div className="container mx-auto px-10 py-12 max-w-7xl">
      <div className="flex justify-between items-center mb-12 border-b border-gray-200 pb-8">
        <div>
           <h1 className="text-5xl font-display font-black uppercase tracking-tighter text-slate-900 leading-none">Каталог <br/><span className="text-emerald-600">Admin</span></h1>
           <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-4">Автоматическое сохранение при изменении</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-2xl border-t-8 border-emerald-600 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F9F9F7]">
            <TableRow className="uppercase tracking-widest text-[10px] font-bold text-gray-500">
              <TableHead className="w-16 h-12">Фото</TableHead>
              <TableHead className="h-12">Название</TableHead>
              <TableHead className="w-32 h-12">Цена (₸)</TableHead>
              <TableHead className="w-40 h-12">Наличие</TableHead>
              <TableHead className="w-40 h-12">Ед. изм.</TableHead>
              <TableHead className="text-right h-12">Ai Фото</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(p => (
              <TableRow key={p.id} className="group">
                <TableCell>
                  {p.image_url ? (
                    <img src={p.image_url} alt="img" className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-gray-400">Нет</div>
                  )}
                </TableCell>
                <TableCell className="font-display font-black text-lg uppercase tracking-tight text-slate-900">{p.name}</TableCell>
                <TableCell>
                   <Input 
                     type="number" 
                     className="w-full h-10 rounded-lg font-bold" 
                     defaultValue={p.base_price} 
                     onBlur={(e) => {
                       const val = parseInt(e.target.value);
                       if (val !== p.base_price && !isNaN(val)) saveProduct(p.id, "base_price", val);
                     }}
                   />
                </TableCell>
                <TableCell>
                  <Select defaultValue={p.stock_status} onValueChange={(v) => saveProduct(p.id, "stock_status", v)}>
                    <SelectTrigger className="h-10 rounded-lg font-bold text-xs uppercase tracking-widest">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="в наличии" className="font-bold text-xs uppercase tracking-widest">В наличии</SelectItem>
                      <SelectItem value="под заказ" className="font-bold text-xs uppercase tracking-widest">Под заказ</SelectItem>
                      <SelectItem value="нет" className="font-bold text-xs uppercase tracking-widest">Нет</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select defaultValue={p.unit} onValueChange={(v) => saveProduct(p.id, "unit", v)}>
                    <SelectTrigger className="h-10 rounded-lg font-bold text-xs uppercase tracking-widest">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="кг" className="font-bold text-xs uppercase tracking-widest">кг</SelectItem>
                      <SelectItem value="лоток" className="font-bold text-xs uppercase tracking-widest">лоток</SelectItem>
                      <SelectItem value="штука" className="font-bold text-xs uppercase tracking-widest">штука</SelectItem>
                      <SelectItem value="ящик" className="font-bold text-xs uppercase tracking-widest">ящик</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 rounded-xl text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-600 hover:text-white transition-colors font-bold uppercase tracking-widest text-[9px] px-4">
                        <ImagePlus className="w-4 h-4 mr-2"/> Ai Фото
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-0 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="font-display font-black uppercase tracking-tight text-xl">Фото для {p.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                         <div className="space-y-4">
                            <Label className="font-bold uppercase tracking-widest text-xs text-gray-500">Промпт для Gemini</Label>
                            <Input 
                               placeholder="High quality macro photography..." 
                               defaultValue={`Professional food photography of fresh ${p.name}, clean white background, highly detailed`}
                               onChange={e => setPrompt(e.target.value)}
                               className="h-12 rounded-xl"
                            />
                         </div>
                         <Button 
                            className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 rounded-full font-bold uppercase tracking-widest text-[11px]" 
                            disabled={generatingImageId === p.id}
                            onClick={() => {
                               if(!prompt) setPrompt(`Professional food photography of fresh ${p.name}, white background, highly detailed, photorealistic`);
                               generateImage(p);
                            }}
                         >
                            {generatingImageId === p.id ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-2"/>} 
                            {generatingImageId === p.id ? "Генерация..." : "Создать (Gemini 3 Pro Image)"}
                         </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
