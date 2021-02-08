import { computed } from "mobx";
import { observer } from "mobx-react-lite";
import { useStore, ID } from "../store";
import { useDrop } from "react-dnd";
import { forwardRef, PropsWithChildren } from "react";
import { ItemTypes } from "../utils";
import Card from "./Card";

const BoardPresentational = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ isOver: boolean; onAddNewCard: () => any }>
>(({ isOver, children, onAddNewCard }, ref) => (
  <div
    ref={ref}
    className={["board", isOver && "over"].filter(Boolean).join(" ")}
  >
    <button onClick={onAddNewCard}>add new Card</button>
    {children}
  </div>
));

const Board = observer<{ id: ID }>(({ id }) => {
  const { boards } = useStore() ?? {};
  const [{ isOver }, dropRef] = useDrop<
    { type: string; id: string; boardId: string },
    unknown,
    { isOver: boolean }
  >({
    accept: ItemTypes.CARD,
    drop(item) {
      boards?.moveCard(item.id, item.boardId, id);
    },
    collect: monitor => ({
      isOver: !!monitor.isOver()
    })
  });

  const board = computed(() => boards?.getBoardDef(id)).get();

  return (
    <BoardPresentational
      ref={dropRef}
      isOver={isOver}
      onAddNewCard={() => boards?.addNewCard(id)}
    >
      {board?.cards.map(card => (
        <Card key={card.id} {...card} />
      ))}
    </BoardPresentational>
  );
});

export default Board;
