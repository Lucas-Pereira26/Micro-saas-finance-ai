"use server";
import { db } from "@/app/_lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isMatch } from "date-fns";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateAiReport = async (month: string) => {
  if (!isMatch(month, "MM")) {
    throw new Error("Invalid month");
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await clerkClient().users.getUser(userId);
  const userHasPremiumPlan = user.publicMetadata.subscriptionPlan === "premium";
  if (!userHasPremiumPlan) {
    throw new Error("User has no premium plan");
  }

  // Inicializar Google Gemini API
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

  // Configurar o modelo Gemini
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  // Obter transações do banco de dados
  const transactions = await db.transaction.findMany({
    where: {
      date: {
        gte: new Date(`2024-${month}-01`),
        lt: new Date(`2024-${month}-31`),
      },
    },
  });

  // Preparar o prompt para o modelo Gemini
  const content = `Gere um relatório com insights sobre as minhas finanças, com dicas e orientações de como melhorar minha vida financeira. As transações estão divididas por ponto e vírgula. A estrutura de cada uma é {DATA}-{TIPO}-{VALOR}-{CATEGORIA}. São elas:
    ${transactions
      .map(
        (transaction) =>
          `${transaction.date.toLocaleDateString("pt-BR")}-R$${transaction.amount}-${transaction.type}-${transaction.category}`,
      )
      .join(";")}`;

  // Fazer a solicitação ao modelo Gemini
  const result = await model.generateContent(content);

  // Retornar a resposta do modelo
  return result.response.text();
};
