export type TicketBook = {
  id: string;
  colorName: string;
  colorHex: string;
  letter: string;
  from: number;
  to: number;
};

export type Prize = {
  id: string;
  name: string;
  imageDataUrl?: string;
};

export type PoolTicket = {
  key: string;
  bookId: string;
  colorName: string;
  colorHex: string;
  letter: string;
  number: number;
};

export type Winner = {
  id: string;
  drawnAt: number;
  bookId: string;
  colorName: string;
  colorHex: string;
  letter: string;
  number: number;
  prizeName?: string;
  prizeImage?: string;
};

export type RaffleSnapshot = {
  eventName: string;
  books: TicketBook[];
  prizes: Prize[];
  winners: Winner[];
  drawnKeys: string[];
  stageMode: boolean;
};
