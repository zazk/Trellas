import { FC, useState, useEffect } from "react";
import styled from "styled-components";
import TextareaAutosize from "react-textarea-autosize";
import {CardEditBtn} from './Card'

const Container = styled.article`
  position: absolute;
  background: #fff;
  padding: 10px;
  color: #000;
  border-radius: 10px;
`;

const TextArea = styled(TextareaAutosize)`
  width: 100%;
  margin: 10px 0;
  border: none;
  resize: none;
  font-size: 14px;
  font-family: inherit;
`

const CardEdit: FC<{
  onSave: (newDescription: string) => any;
  onExit: () => any;
  position: DOMRect;
  description: string;
}> = ({ onExit, position, onSave, description }) => {
  const [value, setValue] = useState("");
  useEffect(() => setValue(description), [description]);
  return (
    <Container
      style={{
        left: position.left,
        top: position.top,
        width: position.width
      }}
    >
      <TextArea
        value={value}
        onChange={e => setValue(e.target.value)}
        autoFocus
      />
      <CardEditBtn style={{marginRight: 10}} onClick={() => onSave(value)}>save</CardEditBtn>
      <CardEditBtn onClick={onExit}>exit</CardEditBtn>
    </Container>
  );
};

export default CardEdit;
