import { collection, getDocs, doc, setDoc, getDoc, query, where, orderBy, addDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface Category {
  id: string;
  name: string;
  name_kz?: string;
  sort_weight: number;
}

export interface Product {
  id: string;
  name: string;
  name_kz?: string;
  category_id: string;
  base_price: number;
  unit: string;
  is_available: boolean;
  stock_status: string;
  tags: string[];
  season_months: number[];
  sort_weight: number;
  image_url?: string;
}

// Seed the database if empty
export async function initializeDatabase() {
  const usersRef = collection(db, "users");
  const usersSnap = await getDocs(query(usersRef));
  
  const categoriesRef = collection(db, "categories");
  const categoriesSnap = await getDocs(query(categoriesRef));
  
  // If categories Collection is empty, let's assume it needs seeding
  if (categoriesSnap.empty) {
    console.log("Seeding Database from Blueprint...");
    const b: any = blueprint;
    for (const c of b.collections) {
      for (const d of c.documents) {
        if (c.collectionId === 'users') continue; // don't seed users
        await setDoc(doc(db, c.collectionId, d.documentId), d.data);
      }
    }
    console.log("Database seeded successfully.");
  }
}

export async function getCategories(): Promise<Category[]> {
  const categoriesSnap = await getDocs(query(collection(db, "categories"), orderBy("sort_weight")));
  return categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function getProducts(): Promise<Product[]> {
  const productsSnap = await getDocs(collection(db, "products"));
  return productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function updateProduct(id: string, data: Partial<Product>) {
  await updateDoc(doc(db, "products", id), data);
}

export async function createOrder(orderData: any) {
  const docRef = await addDoc(collection(db, "orders"), {
    ...orderData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}
