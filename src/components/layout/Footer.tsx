import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="px-10 py-12 border-t border-gray-200 text-[11px] font-black uppercase tracking-widest text-gray-500 bg-white mt-auto">
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-lg">K</div>
             <span className="text-xl font-black tracking-tighter uppercase text-emerald-600">KökDüken</span>
           </div>
           <p className="opacity-70">© {new Date().getFullYear()} KÖKDÜKEN — B2B SUPPLIER</p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm">
          <span>+7 (707) 555-01-99</span>
          <span className="text-emerald-600">ул. Райымбека 212/1</span>
          <span>zakup@kokduken.kz</span>
        </div>
      </div>
    </footer>
  );
}
