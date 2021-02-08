import { FC, useState, useEffect } from "react";
import styled from "styled-components";
import TextareaAutosize from "react-textarea-autosize";

const Container = styled.article`
  position: absolute;
  background: #fff;
  padding: 10px;
  color: #000;
`;

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
      <TextareaAutosize
        style={{ maxWidth: "100%" }}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button onClick={() => onSave(value)}>save</button>
      <button onClick={onExit}>exit</button>
    </Container>
  );
};

export default CardEdit;
