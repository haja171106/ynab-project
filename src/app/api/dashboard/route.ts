import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  const [expenses, incomes, expensesByCategory] = await Promise.all([
    prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.income.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.expense.groupBy({
      by: ["categoryId"],
      where: { userId },
      _sum: { amount: true },
    }),
  ]);

  const categories: Array<{
    id: string;
    title: string;
  }> = await prisma.category.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
    },
  });

  const categoryMap = Object.fromEntries(
    categories.map((category) => [
      category.id,
      category.title,
    ])
  );

  const totalExpenses = expenses._sum.amount ?? 0;
  const totalIncome = incomes._sum.amount ?? 0;
  const balance = totalIncome - totalExpenses;

  const chartData = expensesByCategory.map((expense) => ({
    name: categoryMap[expense.categoryId] ?? "Unknown",
    value: expense._sum.amount ?? 0,
  }));

  return NextResponse.json({
    totalExpenses,
    totalIncome,
    balance,
    chartData,
  });
}