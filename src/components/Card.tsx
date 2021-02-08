import { useDrag, useDrop } from "react-dnd";
import { FC, useState, useRef, useMemo } from "react";
import type { ID, TCard, TCardContent } from '../store'
import { ItemTypes } from "../utils";
import styled from "styled-components";
import EditCard from './EditCard'

const CardContainer = styled.article`
  width: calc(200px - (10 * 2));
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  padding: 10px;
  margin: 10px 0;
  background-color: #fff;
  color: black;
  box-shadow: 0px 2px 2px #0002, 0px 4px 4px #0003;
`;

const CardSpace = styled.article`
  width: calc(200px - (10 * 2));
  height: 40px;
  border: 5px solid #0005;
`;

export type CardProps = TCard & {
  onUpdateCard: (
    newCard: {id: ID} & Partial<TCardContent>
  ) => any
  onDelete: () => any
};

const Card: FC<CardProps> = ({ id, boardId, text, order = 0, onUpdateCard }) => {
  const ref = useRef<HTMLElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [position, setPosition] = useState<DOMRect | null>(null)
  const [{ isOver }, dropRef] = useDrop<
    { type: string; id: string; boardId: string; order?: number },
    unknown,
    { isOver: boolean }
  >({
    accept: ItemTypes.CARD,
    hover(item) {
      item.order = order;
    },
    collect: monitor => ({ isOver: !!monitor.isOver() })
  });
  const [{ opacity, isDragging }, dragRef] = useDrag({
    item: { type: ItemTypes.CARD, id, boardId, order },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
      isDragging: monitor.isDragging()
    })
  });
  const textParsed = useMemo(()=> text.replace(/(?:\r\n|\r|\n)/g, '<br>'), [text])
  dragRef(ref)
  return (
    <div ref={dropRef} style={{ order }}>
      {isOver && <CardSpace />}
      <CardContainer
        ref={ref}
        style={{
          opacity,
          ...(isDragging ? { display: "none" } : {})
        }}
      >
      <p dangerouslySetInnerHTML={{__html: textParsed}} />
        <button onClick={() => {
          setPosition(ref.current?.getBoundingClientRect() ?? null)
          setIsEditing(true)
        }}>edit</button>
      </CardContainer>
      {isEditing && position&& <EditCard
        position={position}
        onExit={() => setIsEditing(false)}
        description={text}
        onSave={(text) => {
          setIsEditing(false)
          onUpdateCard({id, text})
        }}
        />}
    </div>
  );
};

export default Card;
