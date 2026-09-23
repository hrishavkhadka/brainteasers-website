import { createClient } from "@/lib/supabase/server";
import type { VoteValue } from "./votes";

export async function getUserVotes(
  userId: string,
  questionIds: string[],
): Promise<Record<string, VoteValue>> {
  if (questionIds.length === 0) return {};

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_votes")
    .select("question_id, value")
    .eq("user_id", userId)
    .in("question_id", questionIds);

  if (error) throw error;

  const map: Record<string, VoteValue> = {};
  data?.forEach((row) => {
    map[row.question_id] = row.value as VoteValue;
  });
  return map;
}
