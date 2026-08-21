export const REAL_AUDIO_POOL = [
  "https://completecritter.co.uk/uploads/1787058118_Complete_Critter_-_Spellcaster.mp3",
  "https://completecritter.co.uk/uploads/1786120630_Complete_Critter_-_Child_Of_The_Corn.mp3",
  "https://completecritter.co.uk/uploads/1787058877_Complete_Critter_-_So_What.mp3",
  "https://completecritter.co.uk/uploads/1787058878_Compelte_Critter_-_Crazy.mp3",
  "https://completecritter.co.uk/uploads/1787058879_Complete_Critter_-_Complete_Critter.mp3",
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/8sj6j9j9cf_1775559294046.mp3",
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/ww85dxqerce_1775720715108.mp3",
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/160s7b0hwey_1776506557261.mp3",
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/78g9965doyd_1776687690220.mp3",
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/tzy3lzz1eal_1775840041288.mp3",
];

export const HIPHOP_AUDIO_POOL = [
  "https://completecritter.co.uk/uploads/1787058118_Complete_Critter_-_Spellcaster.mp3",
  "https://completecritter.co.uk/uploads/1786120630_Complete_Critter_-_Child_Of_The_Corn.mp3",
  "https://completecritter.co.uk/uploads/1787058877_Complete_Critter_-_So_What.mp3",
  "https://completecritter.co.uk/uploads/1787058878_Compelte_Critter_-_Crazy.mp3",
  "https://completecritter.co.uk/uploads/1787058879_Complete_Critter_-_Complete_Critter.mp3",
];

export const AMBIENT_AUDIO_POOL = [
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/8sj6j9j9cf_1775559294046.mp3",
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/ww85dxqerce_1775720715108.mp3",
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/160s7b0hwey_1776506557261.mp3",
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/78g9965doyd_1776687690220.mp3",
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/tzy3lzz1eal_1775840041288.mp3",
];

export function resolveAudioUrl(url?: string | null, seed?: string, category?: string | null): string {
  if (url && (url.includes("supabase.co") || url.includes("completecritter.co.uk/uploads/"))) {
    return url;
  }

  // Simple string hash function for deterministic track selection based on seed name/id
  let hash = 0;
  const str = (seed || "") + (category || "");
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash);

  const catLower = (category || "").toLowerCase();
  if (catLower.includes("hip-hop") || catLower.includes("hip hop") || catLower.includes("rap") || (seed && seed.toLowerCase().includes("hip hop"))) {
    return HIPHOP_AUDIO_POOL[index % HIPHOP_AUDIO_POOL.length];
  }

  if (catLower.includes("gothic") || catLower.includes("sleep") || catLower.includes("meditation") || catLower.includes("ambient")) {
    return AMBIENT_AUDIO_POOL[index % AMBIENT_AUDIO_POOL.length];
  }

  return REAL_AUDIO_POOL[index % REAL_AUDIO_POOL.length];
}
