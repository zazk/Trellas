import type { FC } from 'react'
import { useState, createContext, useContext } from "react";
import { observer } from "mobx-react-lite";
import { observable, action, computed } from "mobx";
import { uniqid } from "./utils";

export type ID = string;
export interface TStore {
  boards: BoardState;
}
export interface TCard {
  text: string;
  id: ID;
  boardId: ID;
  order: number;
}
export interface TBoard<T = TCard[]> {
  id: ID;
  name: string;
  cards: T;
}

export type TCardContent = Omit<TCard, "id" | "boardId">;
type TBoardContent = Omit<TBoard<Map<TCard["id"], TCardContent>>, "id">;

// -----------

class BoardState {
  private boards = observable.map(new Map<TBoard["id"], TBoardContent>([]), { deep: true });

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

  @computed get boardsIds(): TBoard["id"][] {
    return Array.from(this.boards.keys());
  }

  getBoardDef(boardId: ID): TBoard | null {
    const board = this.boards.get(boardId);
    if (!board) return null;

    return {
      id: boardId,
      ...board,
      cards: Array.from(board.cards).map(([cardId, card]) => ({
        id: cardId,
        boardId,
        ...card
      }))
    };
  }

  @action addNewBoard() {
    this.boards.set(uniqid(), { name: '', cards: new Map() });
  }
  @action addNewCard(boardId: ID, newCardData: Partial<TCardContent> = {}) {
    const boardStore = this.boards.get(boardId);
    if (boardStore) {
      const newID = uniqid();
      const newCard = {
        ...newCardData,
        text: `card: ${newID}`,
        order: boardStore.cards.size
      };

      boardStore.cards.set(newID, newCard);
    }
  }

  @action moveCard(
    cardId: ID,
    boardTargetId: ID,
    boardDestId: ID,
    order: number
  ) {
    console.log(cardId, boardTargetId, boardDestId, order);
    if (boardTargetId !== boardDestId) {
      const card = this.boards.get(boardTargetId)?.cards.get(cardId);
      if (card) {
        this.boards.get(boardTargetId)?.cards.delete(cardId);
        Array.from(this.boards.get(boardDestId)?.cards.entries() ?? []).forEach(
          ([id, item]) => {
            if (item.order >= order) {
              this.boards
                .get(boardDestId)
                ?.cards.set(id, { ...item, order: item.order + 1 });
            }
          }
        );
        this.boards.get(boardDestId)?.cards.set(cardId, { ...card, order });
      }
    } else {
      Array.from(this.boards.get(boardDestId)?.cards.entries() ?? []).forEach(
        ([id, item]) => {
          if (id === cardId) {
            this.boards.get(boardDestId)?.cards.set(id, { ...item, order });
          } else if (item.order >= order) {
            this.boards
              .get(boardDestId)
              ?.cards.set(id, { ...item, order: item.order + 1 });
          }
        }
      );
    }
  }
  @action updateCard(cardId: ID, boardId: ID, card: Partial<TCardContent>) {
    if (this.boards.get(boardId)?.cards.has(cardId)) {
      const old = this.boards.get(boardId)?.cards.get(cardId)!;
      this.boards.get(boardId)?.cards.set(cardId, { ...old, ...card });
    }
  }
  @action updateBoard(boardId: ID, board: Partial<Omit<TBoard, 'cards' | 'id'>>) {
    if (this.boards.has(boardId)) {
      const boardOld = this.boards.get(boardId)!;
      this.boards.set(boardId, { ...boardOld, ...board })
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
