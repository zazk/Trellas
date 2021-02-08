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

const ListContainer = styled.section`
  position: relative;
  width: 300px;
  background-color: #fffa;
  margin: 10px;
  padding: 10px;
  &.over {
    background-color: #fff6;
  }
`;
const ListCardsContainer = styled.section`
  display: flex;
  flex-direction: column;
`;

const ListPresentational = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ isOver: boolean; onAddNewCard: () => any }>
>(({ isOver, children, onAddNewCard }, ref) => (
  <ListContainer
    ref={ref}
    className={[isOver && "over"].filter(Boolean).join(" ")}
  >
    <ListCardsContainer>{children}</ListCardsContainer>
    <button onClick={onAddNewCard}>add new Card</button>
  </ListContainer>
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
  lists?: TStore["lists"];
  onBlur: () => any;
  id: ID;
}>(({ onBlur, lists, id }) => {
  const [value, setValue] = useState("");
  useEffect(() => {
    const tiemId = setTimeout(() => {
      lists?.updateList(id, { name: value });
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

const List = observer<{ id: ID }>(({ id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { lists } = useStore() ?? {};
  const [{ isOver, isOverShallow }, dropRef] = useDrop<
    { type: string; id: string; listId: string; order?: number },
    unknown,
    { isOver: boolean; isOverShallow: boolean }
  >({
    accept: ItemTypes.CARD,
    drop(item) {
      lists?.moveCard(item.id, item.listId, id, item.order ?? 0);
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      isOverShallow: !!monitor.isOver({ shallow: true })
    }),
    hover(item, monitor) {
      if (monitor.isOver({ shallow: true })) item.order = 0;
    }
  });

  const list = computed(() => lists?.getListDef(id)).get();

  const onUpdateCard = useCallback(
    (newCard: Parameters<ComponentProps<typeof Card>["onUpdateCard"]>[0]) => {
      const { id: cardID, ...rest } = newCard;
      lists?.updateCard(cardID, id, rest);
    },
    []
  );
  const onDelete = useCallback(() => {}, []);

  return (
    <ListPresentational
      ref={dropRef}
      isOver={isOver}
      onAddNewCard={() => lists?.addNewCard(id)}
    >
      {isEditing && (
        <InputName id={id} onBlur={() => setIsEditing(false)} lists={lists} />
      )}
      {!isEditing && (
        <Name onClick={() => setIsEditing(true)}>{list?.name}</Name>
      )}
      {list?.cards.map(card => (
        <Card
          key={card.id}
          {...card}
          onUpdateCard={onUpdateCard}
          onDelete={onDelete}
        />
      ))}
      {isOverShallow && <CardSpace />}
    </ListPresentational>
  );
});

export default List;
