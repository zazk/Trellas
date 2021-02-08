import { useStore } from "../store";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

const Button = styled.button`
  width: 200px;
  height: 40px;
  flex: 0 1 auto;
  border: 0;
  margin: 20px;
  border-radius: 10px;
  background:  none;
  color: #fffa;
  border: 1px solid #fffa;
  cursor: pointer
`;

const AddNewList = observer(() => {
  const { lists } = useStore() ?? {};
  return <Button onClick={() => lists?.addNewList(`List ${(lists?.listIds.length ?? 0) + 1}`)}>add new List</Button>;
});

export default AddNewList;
