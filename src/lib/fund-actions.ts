"use server";

import { createClient } from "./supabase-server";
import { revalidatePath } from "next/cache";

const DEFAULT_PAGE_SIZE = 20;

export async function getFunds(cursor?: string, pageSize = DEFAULT_PAGE_SIZE) {
  const supabase = await createClient();

  let query = supabase
    .from("funds")
    .select(
      `
      *,
      member:members(id, full_name)
    `,
    )
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(pageSize + 1); // +1 để detect hasMore

  // Cursor pagination: lấy các record cũ hơn cursor (transaction_date)
  if (cursor) {
    query = query.lt("transaction_date", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching funds:", error);
    return { error: error.message, data: null, hasMore: false };
  }

  const hasMore = (data?.length ?? 0) > pageSize;
  const items = hasMore ? data!.slice(0, pageSize) : (data ?? []);
  const nextCursor = hasMore
    ? items[items.length - 1]?.transaction_date
    : undefined;

  return { error: null, data: items, hasMore, nextCursor };
}

export async function addTransaction(formData: FormData) {
  const supabase = await createClient();

  const transactionType = formData.get("transaction_type") as string;
  const amountStr = formData.get("amount") as string;
  const amount = Number(amountStr.replace(/,/g, ""));
  const description = formData.get("description") as string;
  const transactionDate = formData.get("transaction_date") as string;
  const memberId = formData.get("member_id") as string | null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.from("funds").insert({
    transaction_type: transactionType,
    amount,
    description,
    transaction_date: transactionDate,
    member_id: memberId || null,
    created_by: user.id,
  });

  if (error) {
    console.error("Error adding transaction:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/fund");
  return { error: null };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("funds").delete().eq("id", id);

  if (error) {
    console.error("Error deleting transaction:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/fund");
  return { error: null };
}

export async function getFundBalance() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_fund_balance");

  if (error) {
    console.error("Error fetching fund balance:", error);
    return { error: error.message, balance: 0 };
  }

  return { error: null, balance: Number(data) || 0 };
}

export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient();

  const transactionType = formData.get("transaction_type") as string;
  const amountStr = formData.get("amount") as string;
  const amount = Number(amountStr.replace(/,/g, ""));
  const description = formData.get("description") as string;
  const transactionDate = formData.get("transaction_date") as string;
  const memberId = formData.get("member_id") as string | null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const newData = {
    transaction_type: transactionType,
    amount,
    description,
    transaction_date: transactionDate,
    member_id: memberId || null,
  };

  // Update fund
  const { error: updateError } = await supabase
    .from("funds")
    .update(newData)
    .eq("id", id);

  if (updateError) {
    console.error("Error updating transaction:", updateError);
    return { error: updateError.message };
  }

  revalidatePath("/admin");
  revalidatePath("/fund");
  return { error: null };
}

export async function getFundSummary() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("funds")
    .select("amount, transaction_type, transaction_date");

  if (error) {
    console.error("Error fetching fund summary:", error);
    return { error: error.message, data: null };
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const monthlyData: Record<string, { income: number; expense: number }> = {};

  data?.forEach((trx) => {
    if (trx.transaction_type === "thu") {
      totalIncome += trx.amount;
    } else {
      totalExpense += trx.amount;
    }

    const monthKey = trx.transaction_date.substring(0, 7); // YYYY-MM
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }
    if (trx.transaction_type === "thu") {
      monthlyData[monthKey].income += trx.amount;
    } else {
      monthlyData[monthKey].expense += trx.amount;
    }
  });

  const chartData = Object.keys(monthlyData)
    .sort()
    .map((key) => ({
      month: key,
      ...monthlyData[key],
    }));

  return {
    error: null,
    data: { totalIncome, totalExpense, balance: totalIncome - totalExpense, chartData },
  };
}

export async function getTopContributors(limit = 5) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("funds")
    .select("amount, member:members!inner(id, full_name)")
    .eq("transaction_type", "thu")
    .not("member_id", "is", null);

  if (error) {
    console.error("Error fetching top contributors:", error);
    return { error: error.message, data: null };
  }

  const totals = new Map<string, { id: string; name: string; amount: number }>();

  data?.forEach((trx) => {
    // Note: Due to join, member could theoretically be an array if unexpected relationship, mostly it's single object
    const memberObj = Array.isArray(trx.member) ? trx.member[0] : trx.member;
    if (!memberObj) return;

    const id = memberObj.id;
    if (!totals.has(id)) {
      totals.set(id, { id, name: memberObj.full_name, amount: 0 });
    }
    totals.get(id)!.amount += trx.amount;
  });

  const sortedContributors = Array.from(totals.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);

  return { error: null, data: sortedContributors };
}

export async function getAllTransactions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("funds")
    .select("id, transaction_date, description, amount, transaction_type")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all transactions:", error);
    return { error: error.message, data: null };
  }
  return { error: null, data: data as any[] };
}


