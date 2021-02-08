import type { FC } from 'react'
import { useState, createContext, useContext } from "react";
import { observer } from "mobx-react-lite";
import { observable, action, computed } from "mobx";

export type ID = string;
export interface TStore {
  boards: BoardState;
}
export interface TCard {
  text: string;
  id: ID;
  boardId: ID;
}
export interface TBoard<T = TCard[]> {
  id: ID;
  cards: T;
}

// private
type TCardContet = Omit<TCard, "id" | "boardId">;
type TBoardContent = Omit<
  TBoard<Map<TCard["id"], TCardContet>>,
  "id"
>

// -----------

const uniqid = () =>
  (Math.random() * new Date().getTime()).toString(16).replace(".", "");

class BoardState {
  private boards = observable.map(
    new Map< TBoard["id"],TBoardContent>([])
  );

  @computed get boardsArray(): TBoard[] {
    return Array.from(this.boards).map(([boardId, { cards, ...board }]) => ({
      id: boardId,
      ...board,
      cards: Array.from(cards).map(([cardId, card]) => ({
        id: cardId,
        boardId,
        ...card
      }))
    }));
  }

  @action addNewBoard() {
    this.boards.set(uniqid(), { cards: new Map() });
  }
  @action addNewCard(boardId: ID, newCardData: Partial<TCardContet> = {}) {
    const newID = uniqid();
    const newCard = {
      ...newCardData,
      text: `card: ${newID}`
    };

    this.boards.get(boardId)?.cards.set(newID, newCard);
  }

  @action moveCard(cardId: ID, boardTargetId: ID, boardDestId: ID) {
    const card = this.boards.get(boardTargetId)?.cards.get(cardId);
    if (card) {
      this.boards.get(boardDestId)?.cards.set(cardId, card);
      this.boards.get(boardTargetId)?.cards.delete(cardId);
    }
  }
}

const StoreContext = createContext<TStore | null>(null);

const createStore = (): TStore => ({
  boards: new BoardState()
});

export const useStore = () => {
  const store = useContext(StoreContext);
  if (store === undefined) {
    throw new Error("useStore must be used within a StoreContext.");
  }
  return store;
};

export const StoreContextProvider: FC = observer(({ children }) => {
  const [store] = useState(createStore);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
});
