import { useMemo, FC, ComponentProps } from "react";
import styled from "styled-components";
import CardEdit from "./CardEdit";
import ReactDOM from "react-dom";

const EditCardConainer = styled.section`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000b;
`;

const EditCard: FC<ComponentProps<typeof CardEdit>> = p => {
  const dom = useMemo(() => {
    return document.getElementById("root-portal");
  }, []);
  if (!dom) return null;
  return ReactDOM.createPortal(
    <EditCardConainer>
      <CardEdit {...p} />
    </EditCardConainer>,
    dom
  );
};

export default EditCard;
