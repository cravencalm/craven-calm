export const CRAVEN_CALM_AUDIO_POOL = [
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/8sj6j9j9cf_1775559294046.mp3", // Dark Calm - Session 1
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/ww85dxqerce_1775720715108.mp3", // Dark Calm - Session 2
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/160s7b0hwey_1776506557261.mp3", // Gothic Meditation - Volume 1
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/78g9965doyd_1776687690220.mp3", // Gothic Meditation - Volume 2
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/0taahmj8nr3p_1775727607615.mp3", // Ruins In The Rain
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/1z5gpjx5a0g_1775740609122.mp3", // The Fallen Sanctuary - Volume 1
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/2yr5liyeav8_1775465413219.mp3", // Through The Hallways
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/704p55sfkzw_1775394408560.mp3", // Where Time Softens
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/9ao6m7mef2l_1776274148730.mp3", // Moonlight Calm
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/b436xzhqzwc_1776336520396.mp3", // Dead Calm
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/bq68cv9otdd_1776338207413.mp3", // Quiet Sky
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/tzy3lzz1eal_1775840041288.mp3", // Oceanside
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/5l0lh3pzr3q_1776421219413.mp3", // Morning Meditation Music
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/3g5fji1r9h8_1776440110751.mp3", // Sailing The Stillness
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/9qd7yb7sdc_1775925414242.mp3", // By The Stream
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/2hpouww3jkh_1776084905523.mp3", // Visions Of An Angel
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/4dr989lvion_1776791350916.mp3", // Gothic Lo-fi - Volume 2
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/8ag2038s7g7_1775916719809.mp3", // The Passing
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/brj4s97z1lb_1776681858443.mp3", // When The Dead Speak
  "https://fehhmbyyslfdwstgqeee.supabase.co/storage/v1/object/public/products_media/products/d7zhr3ypxa_1776609145195.mp3", // Someone's At The Window
];

export function resolveAudioUrl(url?: string | null, seed?: string, category?: string | null): string {
  if (url && url.includes("supabase.co")) {
    return url;
  }

  // Deterministic index calculation based on track/album title
  let hash = 0;
  const str = (seed || "") + (category || "");
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash);

  return CRAVEN_CALM_AUDIO_POOL[index % CRAVEN_CALM_AUDIO_POOL.length];
}
