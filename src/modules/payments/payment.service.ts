import axios from "axios";
import "dotenv/config";
import { prisma } from "../../lib/prisma";
import { Plan, subscriptionStatus } from "../../generated/prisma/enums";
// Importe os Enums gerados pelo Prisma para garantir tipagem correta

const asaasApi = axios.create({
  baseURL: process.env.ASAAS_URL,
  headers: {
    access_token: process.env.ASAAS_API_KEY as string,
    "Content-Type": "application/json",
  },
});

class PaymentService {
  async getOrCreateCustomer(
    name: string,
    email: string,
    cpfCnpj: string,
    userId: number,
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.asaasCustomerId) {
      return user.asaasCustomerId;
    }

    const { data: existing } = await asaasApi.get(`/customers?email=${email}`);
    let customerId;

    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
    } else {
      const { data } = await asaasApi.post("/customers", {
        name,
        email,
        cpfCnpj,
      });
      customerId = data.id;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { asaasCustomerId: customerId },
    });

    return customerId;
  }

  async createSubscription(userId: number, customerId: string, value: number) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextDueDate = tomorrow.toISOString().split("T")[0];

    const { data } = await asaasApi.post("/subscriptions", {
      customer: customerId,
      billingType: "CREDIT_CARD",
      value: value,
      nextDueDate: nextDueDate,
      cycle: "MONTHLY",
      description: `Plano Assinatura - R$ ${value}`,
    });

    // ✅ SALVE O ID AQUI
    if (data.id) {
      await this.saveSubscriptionId(userId, data.id);
    }

    return data;
  }
  async createPixPayment(customerId: string, value: number) {
    const { data } = await asaasApi.post("/payments", {
      customer: customerId,
      billingType: "PIX",
      value: value,
      dueDate: new Date().toISOString().split("T")[0],
      description: `Ativação de Plano - R$ ${value}`,
    });
    return data;
  }

  async getUserByCustomerId(customerId: string) {
    return await prisma.user.findFirst({
      where: { asaasCustomerId: customerId },
    });
  }

  // ATUALIZADO: Agora usa os Enums do seu Prisma
  // No PaymentService.ts dentro de updateUserSubscriptionStatus

  async updateUserSubscriptionStatus(
    userId: number,
    status: subscriptionStatus,
    planValue?: number,
  ) {
    let userPlan: Plan = Plan.FREE;

    if (status === "ATIVO" && planValue) {
      // Mapeamento exato dos valores do seu Frontend
      if (planValue === 15) userPlan = Plan.ESSENCIAL;
      if (planValue === 20) userPlan = Plan.PRO;
      if (planValue === 25) userPlan = Plan.ELITE;
    }

    return await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: status,
        plan: userPlan,
      },
    });
  }
  async saveSubscriptionId(userId: number, subscriptionId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { asaasSubscriptionId: subscriptionId },
    });
  }

  async cancelSubscription(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    console.log(user);

    if (!user?.asaasSubscriptionId) {
      throw new Error("Usuário não possui uma assinatura ativa.");
    }

    // Deleta a assinatura no Asaas
    const { data } = await asaasApi.delete(
      `/subscriptions/${user.asaasSubscriptionId}`,
    );

    // Opcional: Já atualiza no banco na hora (ou espera o Webhook)
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "CANCELADO",
        plan: "FREE",
        asaasSubscriptionId: null,
      },
    });

    return data;
  }
}

export default new PaymentService();
