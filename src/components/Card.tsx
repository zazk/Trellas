import { useDrag, useDrop } from "react-dnd";
import { FC } from "react";
import type { ID, TCard } from '../store'
import { ItemTypes } from "../utils";
import styled from "styled-components";

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

export type CardProps = TCard;

const Card: FC<CardProps> = ({ id, boardId, text, order = 0 }) => {
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

  return (
    <div ref={dropRef} style={{ order }}>
      {isOver && <CardSpace />}
      <CardContainer
        ref={dragRef}
        style={{
          opacity,
          ...(isDragging ? { display: "none" } : {})
        }}
      >
        {text}
      </CardContainer>
    </div>
  );
};

export default Card;
