import { observer } from "mobx-react-lite";
import {
  ID,
  State,
  moveCardAction,
  updateCardAction,
  updateListAction,
  addNewCardAction
} from "../store";
import { useDrop } from "react-dnd";
import { useState, useCallback, ComponentProps } from "react";
import { ItemTypes } from "../utils";
import Card, { CardSpace } from "./Card";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

const ListContainer = styled.section`
  position: relative;
  width: 300px;
  background-color: #fffa;
  margin: 20px;
  padding: 10px;
  border-radius: 10px;
  &.over {
    background-color: #fff6;
  }
`;
const ListCardsContainer = styled.section`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
`;

const AddCardButton = styled.button`
  border: 0;
  background: none;
  color: #282c34;
  width: 100%;
  text-align: left;
  padding: 10px 0;
  font-size: 14px;
  cursor: pointer;
`;

const NameStyled = styled.h1`
  width: 100%;
  font-size: 16px;
  margin: 0;
  height: 34px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #282c34dd;
`;

const InputName = styled.input`
  width: 100%;
`;

const Name = observer<{
  name: string;
  onUpdateName: (newName: string) => any;
}>(({ onUpdateName, name = "" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const onBlur = useCallback(() => {
    onUpdateName(value);
    setIsEditing(false);
  }, []);
  const onEdit = useCallback(() => {
    setValue(name);
    setIsEditing(true);
  }, [name]);

  return isEditing ? (
    <InputName
      autoFocus
      type="text"
      value={value}
      onBlur={onBlur}
      onChange={e => setValue(e.target.value)}
    />
  ) : (
    <NameStyled onClick={onEdit}>{name || <i>no name</i>}</NameStyled>
  );
});

const List = observer<{ id: ID }>(({ id }) => {
  const dispatch = useDispatch();
  const currentList = useSelector((state: State) => {
    const current = state.list[id];
    if (!current) return null;
    console.log(current.name);
    return {
      ...current,
      cards: Object.entries(current.cards).map(([cardId, data]) => ({
        id: cardId,
        listId: id,
        ...data
      }))
    };
  });

  const [{ isOver, isOverShallow }, dropRef] = useDrop<
    { type: string; id: string; listId: string; order?: number },
    unknown,
    { isOver: boolean; isOverShallow: boolean }
  >({
    accept: ItemTypes.CARD,
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      isOverShallow: !!monitor.isOver({ shallow: true })
    }),
    drop(item) {
      dispatch(moveCardAction(item.id, item.listId, id, item.order ?? 0));
    },
    hover(item, monitor) {
      if (monitor.isOver({ shallow: true })) {
        if (item.listId === id) {
          item.order = currentList ? currentList.cards.length - 1 : 0;
        } else {
          item.order = currentList?.cards.length ?? 0;
        }
        // item.order = 0;
      }
    }
  });

  const onUpdateCard = useCallback(
    (newCard: Parameters<ComponentProps<typeof Card>["onUpdateCard"]>[0]) => {
      const { id: cardId, ...rest } = newCard;
      dispatch(updateCardAction(id, cardId, rest));
    },
    []
  );

  const onDelete = useCallback(() => {}, []);

  if (!currentList) return null;

  return (
    <ListContainer ref={dropRef} className={isOver ? "over" : ""}>
      <Name
        name={currentList.name}
        onUpdateName={value => dispatch(updateListAction(id, { name: value }))}
      />
      <ListCardsContainer>
        {currentList.cards.map(card => (
          <Card
            key={card.id}
            {...card}
            onUpdateCard={onUpdateCard}
            onDelete={onDelete}
          />
        ))}
        {isOverShallow && (
          <CardSpace style={{ order: currentList.cards.length }} />
        )}
      </ListCardsContainer>
      <AddCardButton onClick={() => dispatch(addNewCardAction(id))}>
        + Add new Card
      </AddCardButton>
    </ListContainer>
  );
});

export default List;
