export interface Destination {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  location: string;
  image_url: string;
  category?: { name: string };
  images?: { id: number; image_path: string }[];
  inclusions?: { id: number; name: string }[];
  addons?: { id: number; name: string; price: number }[];
  reviews?: {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    image?: string;
    user?: {
      name: string;
      avatar_url?: string;
    };
  }[];
}