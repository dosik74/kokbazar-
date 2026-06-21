import { useEffect, useState } from "react";
import { auth, googleProvider } from "@/src/lib/firebase/firebase";
import { signInWithPopup, signOut, User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/src/lib/firebase/firebase";
import { LogOut, Package, RefreshCw } from "lucide-react";
import { useCartStore } from "@/src/store";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{ productId: string, name: string, quantity: number, price: number, unit: string }>;
}

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const cart = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        fetchOrders(u.uid);
      } else {
        setOrders([]);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchOrders = async (uid: string) => {
    try {
      const q = query(
        collection(db, "orders"), 
        where("userId", "==", uid),
      );
      const snap = await getDocs(q);
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      fetched.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(fetched);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      toast.error(e.message || "Ошибка авторизации");
    }
  }

  const handleLogout = async () => {
    await signOut(auth);
  }

  const repeatOrder = (order: Order) => {
    cart.clearCart();
    order.items.forEach(item => {
       cart.addItem({
         id: item.productId,
         name: item.name,
         category_id: "", // dummy
         base_price: item.price,
         unit: item.unit,
         is_available: true,
         stock_status: "в наличии",
         tags: [],
         season_months: [],
         sort_weight: 0
       }, item.quantity);
    });
    toast.success("Товары добавлены в текущую заявку");
    navigate("/calculator");
  }

  if (!user && !loading) {
     return (
       <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center max-w-md">
         <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600">
           <Package className="w-10 h-10" />
         </div>
         <h1 className="text-3xl font-display font-black text-emerald-950 mb-4">Личный кабинет</h1>
         <p className="text-gray-500 mb-8">Войдите в систему, чтобы отслеживать статусы заявок и повторять прошлые заказы в один клик.</p>
         <Button onClick={handleLogin} size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
           Войти через Google
         </Button>
       </div>
     )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
       <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-50 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
             {user?.photoURL ? (
               <img src={user.photoURL} alt="Avatar" className="w-16 h-16 rounded-full" />
             ) : (
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-xl">
                 {user?.displayName?.[0] || 'U'}
               </div>
             )}
             <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.displayName || "Пользователь"}</h1>
                <p className="text-gray-500">{user?.email}</p>
             </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" /> Выйти
          </Button>
       </div>

       <h2 className="text-2xl font-display font-black text-emerald-950 mb-6">История заявок</h2>

       {loading ? (
         <div className="animate-pulse space-y-4">
           {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
         </div>
       ) : orders.length === 0 ? (
         <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
           <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-gray-900 mb-2">Заявок пока нет</h3>
           <p className="text-gray-500 mb-6">Вы еще не оформляли оптовые заявки</p>
           <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
             <Link to="/catalog">Перейти в каталог</Link>
           </Button>
         </div>
       ) : (
         <div className="space-y-4">
           {orders.map(order => (
             <Card key={order.id} className="rounded-2xl border-0 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-4 gap-4">
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-gray-900">Заявка #{order.id.slice(0,8)}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium uppercase">{order.status}</span>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('ru-RU')}</p>
                     </div>
                     <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                        <div className="text-right">
                           <div className="text-xs text-gray-400">Сумма</div>
                           <div className="font-black text-emerald-700">{order.totalAmount} ₸</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => repeatOrder(order)} className="rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                           <RefreshCw className="w-4 h-4 mr-2" /> Повторить
                        </Button>
                     </div>
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                     <span className="font-medium">Состав:</span> {order.items.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}
                  </div>
                </CardContent>
             </Card>
           ))}
         </div>
       )}
    </div>
  );
}
