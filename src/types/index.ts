declare module 'fastify' {
  export interface FastifyRequest {
    rawBody: Buffer;
  }
}

export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

export type WalletTransaction = {
  amount: number;
  title?: string;
  category?: string;
  tags?: string[];
  type: TransactionType;
};
