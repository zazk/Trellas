import { useDrag, useDrop } from "react-dnd";
import { FC, useState, useRef, useMemo, useCallback } from "react";
import type { ID, TCard } from '../store/index'
import { ItemTypes } from "../utils";
import styled from "styled-components";
import EditCard from "./EditCard";

const CardContainer = styled.article`
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  padding: 10px;
  margin: 10px 0;
  background-color: #fff;
  color: black;
  box-shadow: 0px 2px 2px #0002, 0px 4px 4px #0003;
  cursor: grab;
  &:first-child {
    margin-top: 0;
  }
  &:active {
    cursor: grabbing;
  }
  &.draggin {
    display: none;
  }
`;

export const CardSpace = styled.article`
  height: 102px;
  width: calc(100% + 10px);
  border: 5px dashed #0005;
  margin: 10px 0;
  border-radius: 10px;
  margin -5px;
`;

const CardText = styled.p`
  margin: 10px 0;
  font-size: 14px;
`;

export const CardEditBtn = styled.button`
  background: #0003;
  border: none;
  padding: 8px;
  border-radius: 8px;
  width: 80px;
  cursor: pointer;
`;

type CardProps = TCard & {
  id: string;
  listId: string;
  onUpdateCard: (newCard: { id: ID } & Partial<TCard>) => any;
  onDelete: () => any;
};

const Card: FC<CardProps> = ({ id, listId, text, order = 0, onUpdateCard }) => {
  const ref = useRef<HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState<DOMRect | null>(null);

  const [{ isOver }, dropRef] = useDrop<
    { type: string; id: string; listId: string; order?: number },
    unknown,
    { isOver: boolean }
  >({
    accept: ItemTypes.CARD,
    hover(item) {
      item.order = order;
    },
    collect: monitor => ({
      isOver: monitor.isOver()
    })
  });

  const [{ isDragging }, dragRef] = useDrag({
    item: { type: ItemTypes.CARD, id, listId, order },
    collect: monitor => ({ isDragging: monitor.isDragging() })
  });

  const onEditHandler = useCallback(() => {
    setPosition(ref.current?.getBoundingClientRect() ?? null);
    setIsEditing(true);
  }, []);
  const onSaveEditHandler = useCallback((text: string) => {
    setIsEditing(false);
    onUpdateCard({ id, text });
  }, []);

  const textParsed = useMemo(() => text.replace(/(?:\r\n|\r|\n)/g, "<br>"), [
    text
  ]);

  dragRef(ref);

  return (
    <div ref={dropRef} style={{ order }}>
      {isOver && <CardSpace />}

      <CardContainer ref={ref} className={isDragging ? "draggin" : ""}>
        <CardText dangerouslySetInnerHTML={{ __html: textParsed }} />
        <CardEditBtn onClick={onEditHandler}>Edit</CardEditBtn>
      </CardContainer>

      {isEditing && position && (
        <EditCard
          position={position}
          onExit={() => setIsEditing(false)}
          description={text}
          onSave={onSaveEditHandler}
        />
      )}
    </div>
  );
};

export default Card;
