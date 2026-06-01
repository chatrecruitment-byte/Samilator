export interface Product {
  id: number
  name: string
  price: number
  thumbnail: string
}

export const PRODUCTS: Product[] = [
  { id: 1, name: "תמונה רגילה", price: 5, thumbnail: "/products/p1.jpg" },
  { id: 2, name: "תמונה חמה", price: 15, thumbnail: "/products/p2.jpg" },
  { id: 3, name: "תמונה חמה מאוד", price: 25, thumbnail: "/products/p3.jpg" },
  { id: 4, name: "סרטון קצר", price: 20, thumbnail: "/products/p4.jpg" },
  { id: 5, name: "סרטון ארוך", price: 40, thumbnail: "/products/p5.jpg" },
  { id: 6, name: "סרטון חם", price: 50, thumbnail: "/products/p6.jpg" },
  { id: 7, name: "תמונת פנים", price: 10, thumbnail: "/products/p7.jpg" },
  { id: 8, name: "תמונה אישית", price: 30, thumbnail: "/products/p8.jpg" },
  { id: 9, name: "חבילת תמונות", price: 60, thumbnail: "/products/p9.jpg" },
  { id: 10, name: "חבילת סרטונים", price: 100, thumbnail: "/products/p10.jpg" },
]
