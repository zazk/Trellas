import { computed } from "mobx";
import { observer } from "mobx-react-lite";
import { useStore, ID } from "../store";
import { useDrop } from "react-dnd";
import { forwardRef, PropsWithChildren } from "react";
import { ItemTypes } from "../utils";
import Card from "./Card";
import styled from "styled-components";

const BoardContainer = styled.section`
  position: relative;
  width: 200px;
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

const Board = observer<{ id: ID }>(({ id }) => {
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

  return (
    <BoardPresentational
      ref={dropRef}
      isOver={isOver}
      onAddNewCard={() => boards?.addNewCard(id)}
    >
      {board?.cards.map(card => (
        <Card key={card.id} {...card} />
      ))}
      {isOverShallow && <CardSpace />}
    </BoardPresentational>
  );
});

export default Board;
