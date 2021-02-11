import type { FC } from 'react'
import { useState, createContext, useContext } from "react";
import { observer } from "mobx-react-lite";
import { observable, action, computed } from "mobx";
import { uniqid } from "./utils";

export type ID = string;
export interface TStore {
  lists: ListState;
}
export interface TCard {
  text: string;
  id: ID;
  listId: ID;
  order: number;
}
export interface TList<T = TCard[]> {
  id: ID;
  name: string;
  cards: T;
}

export type TCardContent = Omit<TCard, "id" | "listId">;
type TListContent = Omit<TList<Map<TCard["id"], TCardContent>>, "id">;

// -----------

class ListState {
  private lists = observable.map(new Map<TList["id"], TListContent>([]), {
    deep: true
  });

  @computed get listsArray(): TList[] {
    return Array.from(this.lists).map(([listId, { cards, ...list }]) => ({
      id: listId,
      ...list,
      cards: Array.from(cards).map(([cardId, card]) => ({
        id: cardId,
        listId,
        ...card
      }))
    }));
  }

  @computed get listIds(): TList["id"][] {
    return Array.from(this.lists.keys());
  }

  getListDef(listId: ID): TList | null {
    const list = this.lists.get(listId);
    if (!list) return null;

    return {
      id: listId,
      ...list,
      cards: Array.from(list.cards).map(([cardId, card]) => ({
        id: cardId,
        listId,
        ...card
      }))
    };
  }

  @action addNewList(name: string = '') {
    this.lists.set(uniqid(), { name, cards: new Map() });
  }
  @action addNewCard(listId: ID, newCardData: Partial<TCardContent> = {}) {
    const listStore = this.lists.get(listId);
    if (listStore) {
      const newID = uniqid();
      const newCard = {
        ...newCardData,
        text: `card: ${newID}`,
        order: listStore.cards.size
      };

      listStore.cards.set(newID, newCard);
    }
  }

  @action moveCard(
    cardId: ID,
    listTargetId: ID,
    listDestId: ID,
    order: number
  ) {
    console.log(cardId, listTargetId, listDestId, order);
    if (listTargetId !== listDestId) {
      const card = this.lists.get(listTargetId)?.cards.get(cardId);
      if (card) {
        this.lists.get(listTargetId)?.cards.delete(cardId);
        Array.from(this.lists.get(listDestId)?.cards.entries() ?? []).forEach(
          ([id, item]) => {
            if (item.order >= order) {
              this.lists
                .get(listDestId)
                ?.cards.set(id, { ...item, order: item.order + 1 });
            }
          }
        );
        this.lists.get(listDestId)?.cards.set(cardId, { ...card, order });
      }
    } else {
      Array.from(this.lists.get(listDestId)?.cards.entries() ?? []).forEach(
        ([id, item]) => {
          if (id === cardId) {
            this.lists.get(listDestId)?.cards.set(id, { ...item, order });
          } else if (item.order >= order) {
            this.lists
              .get(listDestId)
              ?.cards.set(id, { ...item, order: item.order + 1 });
          }
        }
      );
    }
  }
  @action updateCard(cardId: ID, listId: ID, card: Partial<TCardContent>) {
    if (this.lists.get(listId)?.cards.has(cardId)) {
      const old = this.lists.get(listId)?.cards.get(cardId)!;
      this.lists.get(listId)?.cards.set(cardId, { ...old, ...card });
    }
  }
  @action updateList(
    listId: ID,
    list: Partial<Omit<TList, "cards" | "id">>
  ) {
    if (this.lists.has(listId)) {
      const listOld = this.lists.get(listId)!;
      this.lists.set(listId, { ...listOld, ...list });
    }
  }
}

const StoreContext = createContext<TStore | null>(null);

const createStore = (): TStore => ({
  lists: new ListState()
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
