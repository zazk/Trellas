import { useStore } from "../store";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

const Button = styled.button`
  width: 200px;
  height: 40px;
  flex: 0 1 auto;
  border: 0;
  margin: 10px;
`;

const AddNewBoard = observer(() => {
  const { boards } = useStore() ?? {};
  return <Button onClick={() => boards?.addNewBoard()}>add new Board</Button>;
});

export default AddNewBoard;
