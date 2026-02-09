import { Request, Response } from "express";
import service from "./payment.service";
import { prisma } from "../../lib/prisma";
import axios from "axios";

interface AsaasWebhookBody {
  event: string;
  payment?: {
    id: string;
    customer: string;
    subscription?: string;
    value: number;
  };
  subscription?: {
    id: string;
    customer: string;
  };
}

const asaasApi = axios.create({
  baseURL: process.env.ASAAS_URL,
  headers: {
    access_token: process.env.ASAAS_API_KEY as string,
    "Content-Type": "application/json",
  },
});

export class PaymentController {
  async subscribe(req: Request, res: Response) {
    try {
      const { name, email, cpfCnpj, planValue, billingType } = req.body;

      // 1. Cria ou recupera o cliente
      const customerId = await service.getOrCreateCustomer(
        name,
        email,
        cpfCnpj,
        req.user.id,
      );

      let paymentData;

      if (billingType === "PIX") {
        // O PIX gera a cobrança avulsa direto com invoiceUrl
        paymentData = await service.createPixPayment(customerId, planValue);
      } else {
        // O Cartão gera uma ASSINATURA
        const subscription = await service.createSubscription(
          req.user.id,
          customerId,
          planValue,
        );

        // --- O PULO DO GATO ---
        // Assinaturas não retornam invoiceUrl no objeto principal.
        // Precisamos buscar a fatura que o Asaas acabou de gerar para essa assinatura.
        const { data: invoices } = await asaasApi.get(
          `/subscriptions/${subscription.id}/payments`,
        );

        // Pegamos a primeira fatura da lista
        paymentData = invoices.data[0];
      }

      return res.status(201).json({
        subscriptionId: paymentData.subscription || paymentData.id,
        invoiceUrl: paymentData.invoiceUrl, // Agora este link sempre existirá!
        status: paymentData.status,
      });
    } catch (error: any) {
      console.error("Erro subscribe:", error.response?.data || error.message);
      return res.status(500).json({ error: "Falha ao processar pagamento." });
    }
  } // Removi a duplicata e mantive a versão com segurança (Token)
  async handleWebhook(req: Request, res: Response) {
    const asaasToken = req.headers["asaas-access-token"];

    if (asaasToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const { event, payment, subscription }: AsaasWebhookBody = req.body;
    console.log(`Evento recebido: ${event}`);

    try {
      // 1. Tenta extrair o Customer ID de qualquer lugar possível no JSON
      const customerId = payment?.customer || subscription?.customer;

      if (!customerId) {
        console.error("Webhook recebido sem ID de cliente válido.");
        return res.status(200).send("OK"); // Respondemos 200 para o Asaas não reenviar erro
      }

      // 2. Busca o usuário
      const user = await service.getUserByCustomerId(customerId);

      if (!user) {
        // Se for apenas um teste do painel do Asaas, o ID será "cus_0000000..." e não existirá no seu banco.
        console.warn(
          `Usuário com Asaas Customer ID ${customerId} não encontrado no banco.`,
        );
        return res.status(200).send("Usuário não encontrado localmente.");
      }

      // --- LÓGICA DE ATIVAÇÃO ---

      if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
        // O Asaas envia o valor em payment.value
        const amountPaid = payment?.value;

        // Chama o service passando o status ATIVO (que é um enum do Prisma agora)
        await service.updateUserSubscriptionStatus(
          user.id,
          "ATIVO",
          amountPaid,
        );

        if (payment?.subscription) {
          await service.saveSubscriptionId(user.id, payment.subscription);
        }
      }

      if (event === "SUBSCRIPTION_DELETED") {
        // Quando deletado, volta para FREE e CANCELADO
        await service.updateUserSubscriptionStatus(user.id, "CANCELADO");
      }

      return res.status(200).send("OK");
    } catch (err) {
      console.error("Erro interno no Webhook:", err);
      return res.status(500).send("Erro interno");
    }
  }

  async cancel(req: Request, res: Response) {
    try {
      await service.cancelSubscription(req.user.id);
      return res
        .status(200)
        .json({ message: "Assinatura cancelada com sucesso." });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao cancelar assinatura." });
    }
  }
}

export default new PaymentController();
