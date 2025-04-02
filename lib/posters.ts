import { supabase } from "./supabase"

export async function getPosters() {
  const { data, error } = await supabase.from("posters").select("*")
  if (error) throw error
  return data
}
