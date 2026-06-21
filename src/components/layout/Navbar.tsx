import { Link } from "react-router-dom";
import { useCartStore } from "../../store";
import { Leaf, ShoppingCart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/src/lib/firebase/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#F9F9F7]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F9F9F7]/60">
      <div className="container mx-auto px-10 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
             K
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase text-emerald-600">
            KökDüken
          </span>
        </Link>
        <div className="flex gap-8 items-center font-bold text-sm uppercase tracking-widest text-[#1A1A1A]">
          <Link to="/catalog" className="hover:text-orange-500 transition-colors">
            Каталог
          </Link>
          <Link to="/calculator" className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
            <span>ЗАЯВКА</span>
            {totalItems > 0 && (
              <Badge variant="default" className="bg-white text-orange-500 hover:bg-white px-1.5 py-0 min-w-5 flex justify-center items-center">
                {totalItems}
              </Badge>
            )}
            <ShoppingCart className="w-4 h-4 ml-1" />
          </Link>
          {user ? (
            <Link to="/account" className="hover:text-orange-500 transition-colors flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{user.displayName?.split(' ')[0] || "ПРОФИЛЬ"}</span>
            </Link>
          ) : (
             <Link to="/account" className="hover:text-orange-500 transition-colors flex items-center gap-1">
               <User className="w-4 h-4" />
               <span>ВОЙТИ</span>
             </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
