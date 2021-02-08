import { computed } from "mobx";
import { observer } from "mobx-react-lite";
import { useStore, ID, TStore } from "../store";
import { useDrop } from "react-dnd";
import {
  forwardRef,
  PropsWithChildren,
  useState,
  useEffect,
  useCallback,
  ComponentProps
} from "react";
import { ItemTypes } from "../utils";
import Card from "./Card";
import styled from "styled-components";

const BoardContainer = styled.section`
  position: relative;
  width: 300px;
  background-color: #fffa;
  margin: 10px;
  padding: 10px;
  &.over {
    background-color: #fff6;
  }
`;
const BoardCardsContainer = styled.section`
  display: flex;
  flex-direction: column;
`;

const BoardPresentational = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ isOver: boolean; onAddNewCard: () => any }>
>(({ isOver, children, onAddNewCard }, ref) => (
  <BoardContainer
    ref={ref}
    className={[isOver && "over"].filter(Boolean).join(" ")}
  >
    <BoardCardsContainer>{children}</BoardCardsContainer>
    <button onClick={onAddNewCard}>add new Card</button>
  </BoardContainer>
));

const CardSpace = styled.article`
  width: calc(200px - (10 * 2));
  height: 40px;
  border: 5px solid #0005;
`;

const Name = styled.h1`
  width: 100%;
  height: 20px;
`;

const InputName = observer<{
  boards?: TStore["boards"];
  onBlur: () => any;
  id: ID;
}>(({ onBlur, boards, id }) => {
  const [value, setValue] = useState("");
  useEffect(() => {
    const tiemId = setTimeout(() => {
      boards?.updateBoard(id, { name: value });
    }, 1e300);
    return () => {
      clearTimeout(tiemId);
    };
  }, [id, value]);
  return (
    <input
      type="text"
      onBlur={onBlur}
      value={value}
      onChange={e => {
        setValue(e.target.value);
      }}
      autoFocus
    />
  );
});

const Board = observer<{ id: ID }>(({ id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { boards } = useStore() ?? {};
  const [{ isOver, isOverShallow }, dropRef] = useDrop<
    { type: string; id: string; boardId: string; order?: number },
    unknown,
    { isOver: boolean; isOverShallow: boolean }
  >({
    accept: ItemTypes.CARD,
    drop(item) {
      boards?.moveCard(item.id, item.boardId, id, item.order ?? 0);
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      isOverShallow: !!monitor.isOver({ shallow: true })
    }),
    hover(item, monitor) {
      if (monitor.isOver({ shallow: true })) item.order = 0;
    }
  });

  const board = computed(() => boards?.getBoardDef(id)).get();

  const onUpdateCard = useCallback(
    (newCard: Parameters<ComponentProps<typeof Card>["onUpdateCard"]>[0]) => {
      const { id: cardID, ...rest } = newCard;
      boards?.updateCard(cardID, id, rest);
    },
    []
  );
  const onDelete = useCallback(() => {}, []);

  return (
    <BoardPresentational
      ref={dropRef}
      isOver={isOver}
      onAddNewCard={() => boards?.addNewCard(id)}
    >
      {isEditing && (
        <InputName id={id} onBlur={() => setIsEditing(false)} boards={boards} />
      )}
      {!isEditing && (
        <Name onClick={() => setIsEditing(true)}>{board?.name}</Name>
      )}
      {board?.cards.map(card => (
        <Card
          key={card.id}
          {...card}
          onUpdateCard={onUpdateCard}
          onDelete={onDelete}
        />
      ))}
      {isOverShallow && <CardSpace />}
    </BoardPresentational>
  );
});

export default Board;
