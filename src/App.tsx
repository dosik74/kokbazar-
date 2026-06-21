import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Calculator from "./pages/Calculator";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import { useEffect } from "react";
import { initializeDatabase } from "./lib/firebase/db";

export default function App() {
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="calculator" element={<Calculator />} />
          <Route path="account" element={<Account />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
