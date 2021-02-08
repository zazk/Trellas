import { computed } from "mobx";
import { observer } from "mobx-react-lite";
import { useStore, ID } from "../store";
import { useDrop } from "react-dnd";
import { useState, useEffect, useCallback, ComponentProps } from "react";
import { ItemTypes } from "../utils";
import Card, {CardSpace} from "./Card";
import styled from "styled-components";


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

  useEffect(() => {
    const timeoutId = setTimeout(() => onUpdateName(value), 1e300);
    return () => clearTimeout(timeoutId);
  }, [value]);

  useEffect(() => setValue(name), [name])

  return isEditing ? (
    <InputName
      autoFocus
      type="text"
      value={value}
      onBlur={() => setIsEditing(false)}
      onChange={e => setValue(e.target.value)}
    />
  ) : (
    <NameStyled onClick={() => setIsEditing(true)}>
      {name || <i>no name</i>}
    </NameStyled>
  );
});

const List = observer<{ id: ID }>(({ id }) => {
  const { lists } = useStore() ?? {};

  const currentList = computed(() => lists?.getListDef(id)).get();

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
      lists?.moveCard(item.id, item.listId, id, item.order ?? 0);
    },
    hover(item, monitor) {
      if (monitor.isOver({ shallow: true })) item.order = 0;
    }
  });

  const onUpdateCard = useCallback(
    (newCard: Parameters<ComponentProps<typeof Card>["onUpdateCard"]>[0]) => {
      const { id: cardID, ...rest } = newCard;
      lists?.updateCard(cardID, id, rest);
    },
    []
  );

  const onDelete = useCallback(() => {}, []);

  if (!currentList || !lists) return null;

  return (
    <ListContainer ref={dropRef} className={isOver ? "over" : ""}>
      <Name
        name={currentList.name}
        onUpdateName={value => lists.updateList(id, { name: value })}
      />
      <ListCardsContainer>
        {currentList?.cards.map(card => (
          <Card
            key={card.id}
            {...card}
            onUpdateCard={onUpdateCard}
            onDelete={onDelete}
          />
        ))}
        {isOverShallow && (
          <CardSpace style={{ order: currentList?.cards.length ?? 0 }} />
        )}
      </ListCardsContainer>
      <AddCardButton onClick={() => lists.addNewCard(id)}>
        + Add new Card
      </AddCardButton>
    </ListContainer>
  );
});

export default List;
