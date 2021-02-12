import { createStore } from "redux";
import { uniqid } from "../utils";

// **********************
export type ID = string;
export interface TCard {
  text: string;
  order: number;
}
export interface TList<T = TCard[]> {
  name: string;
  cards: T;
}

// ***********************

const ADD_NEW_LIST = "ADD_NEW_LIST";
const UPDATE_LIST = "UPDATE_LIST";
const ADD_NEW_CARD = "ADD_NEW_CARD";
const UPDATE_CARD = "UPDATE_CARD";
const MOVE_CARD = "MOVE_CARD";

interface AddNewListAction {
  type: typeof ADD_NEW_LIST;
  payload: string;
}
interface UpdateListAction {
  type: typeof UPDATE_LIST;
  payload: {
    listId: string;
    listData: Partial<Omit<TList, "cards">>;
  };
}
interface AddNewCardAction {
  type: typeof ADD_NEW_CARD;
  payload: {
    listId: string;
    cardData: Partial<TCard>;
  };
}
interface UpdateCardAction {
  type: typeof UPDATE_CARD;
  payload: {
    listId: string;
    cardId: string;
    cardData: Partial<TCard>;
  };
}
interface MoveCardAction {
  type: typeof MOVE_CARD;
  payload: {
    listId: string;
    cardId: string;
    order: number;
    listTargetId: string;
  };
}

type ActionTypes =
  | AddNewListAction
  | AddNewCardAction
  | UpdateListAction
  | UpdateCardAction
  | MoveCardAction;

export interface State {
  list: {
    [key: string]: TList<{
      [key: string]: TCard;
    }>;
  };
}

// ------

const initialState: State = {
  list: {}
};
// ------

const reducer = (state = initialState, action: ActionTypes): State => {
  switch (action.type) {
    case ADD_NEW_LIST: {
      const newList: State["list"][string] = {
        name: action.payload ?? "",
        cards: {}
      };

      return {
        ...state,
        list: { ...state.list, [uniqid()]: newList }
      };
    }
    case ADD_NEW_CARD: {
      const { listId, cardData } = action.payload;
      if (!(listId in state.list)) {
        console.error(`${listId} list was not found`);
        return state;
      }
      const newCard: TCard = {
        order: Object.keys(state.list[listId].cards).length,
        text: "",
        ...cardData
      };
      return {
        ...state,
        list: {
          ...state.list,
          [listId]: {
            ...state.list[listId],
            cards: {
              ...state.list[listId].cards,
              [uniqid()]: newCard
            }
          }
        }
      };
    }
    case UPDATE_LIST: {
      const { listId, listData } = action.payload;
      if (!(listId in state.list)) {
        console.error(`${listId} list was not found`);
        return state;
      }
      return {
        ...state,
        list: {
          ...state.list,
          [listId]: {
            ...state.list[listId],
            ...listData
          }
        }
      };
    }
    case UPDATE_CARD: {
      const { listId, cardId, cardData } = action.payload;
      if (!(listId in state.list)) {
        console.error(`${listId} list was not found`);
        return state;
      }
      if (!(cardId in state.list[listId].cards)) {
        console.error(`${listId} card was not found`);
        return state;
      }
      return {
        ...state,
        list: {
          ...state.list,
          [listId]: {
            ...state.list[listId],
            cards: {
              ...state.list[listId].cards,
              [cardId]: {
                ...state.list[listId].cards[cardId],
                ...cardData
              }
            }
          }
        }
      };
    }
    case MOVE_CARD: {
      const { listId, cardId, order, listTargetId } = action.payload;
      // validations
      if (!(listId in state.list)) {
        console.error(`${listId} list was not found`);
        return state;
      }
      if (!(listTargetId in state.list)) {
        console.error(`${listTargetId} list was not found`);
        return state;
      }
      if (!(cardId in state.list[listId].cards)) {
        console.error(`${listId} card was not found`);
        return state;
      }

      // ------
      const movedCard = {
        ...state.list[listId].cards[cardId],
        order
      };

      // change position
      if (listTargetId === listId) {
        const oldPosition = state.list[listId].cards[cardId].order;
        const isUp = oldPosition > order;

        const targetList = {
          ...state.list[listTargetId],
          cards: Object.entries(state.list[listTargetId].cards).reduce(
            (acc, [id, card]) => {
              if (id !== cardId) {
                const newOrder =
                  // -----
                    isUp && oldPosition > card.order && card.order >= order
                      ? card.order + 1
                  // -----
                  : !isUp && oldPosition < card.order && card.order <= order
                      ? card.order - 1
                  // -----
                  : card.order;

                acc[id] = { ...card, order: newOrder };
              }
              return acc;
            },
            { [cardId]: movedCard } as State["list"][string]["cards"]
          )
        };

        return {
          ...state,
          list: { ...state.list, [listTargetId]: targetList }
        };
      }
      // change list
      else {
        const targetList = {
          ...state.list[listTargetId],
          cards: Object.entries(state.list[listTargetId].cards).reduce(
            (acc, [id, card]) => {
              if (id !== cardId) {
                acc[id] = card.order >= order
                  ? { ...card, order: card.order + 1 }
                  : card;
              }
              return acc;
            },
            { [cardId]: movedCard } as State["list"][string]["cards"]
          )
        };

        const sourceList = {
          ...state.list[listId],
          cards: Object.entries(state.list[listId].cards).reduce(
            (acc, [id, card]) => {
              if (id !== cardId) {
                acc[id] = card.order > order
                  ? { ...card, order: card.order - 1 }
                  : card;
              }
              return acc;
            },
            {} as State["list"][string]["cards"]
          )
        };

        return {
          ...state,
          list: {
            ...state.list,
            [listId]: sourceList,
            [listTargetId]: targetList
          }
        };
      }
    }
    default:
      return state;
  }
};

export const addNewListAction = (
  name: AddNewListAction["payload"] = ""
): AddNewListAction => ({
  type: ADD_NEW_LIST,
  payload: name
});
export const updateListAction = (
  listId: UpdateListAction["payload"]["listId"],
  listData: UpdateListAction["payload"]["listData"]
): UpdateListAction => ({
  type: UPDATE_LIST,
  payload: { listId, listData }
});
export const addNewCardAction = (
  listId: AddNewCardAction["payload"]["listId"],
  cardData: AddNewCardAction["payload"]["cardData"] = {}
): AddNewCardAction => ({
  type: ADD_NEW_CARD,
  payload: { listId, cardData }
});
export const updateCardAction = (
  listId: UpdateCardAction["payload"]["listId"],
  cardId: UpdateCardAction["payload"]["cardId"],
  cardData: UpdateCardAction["payload"]["cardData"]
): UpdateCardAction => ({
  type: UPDATE_CARD,
  payload: { listId, cardId, cardData }
});
export const moveCardAction = (
  cardId: MoveCardAction["payload"]["cardId"],
  listId: MoveCardAction["payload"]["listId"],
  listTargetId: MoveCardAction["payload"]["listTargetId"],
  order: MoveCardAction["payload"]["order"]
): MoveCardAction => ({
  type: MOVE_CARD,
  payload: { listId, cardId, order, listTargetId }
});

const store = createStore(
  reducer,
  // @ts-ignore
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
