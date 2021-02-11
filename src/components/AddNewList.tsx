import { useCallback } from "react";
import { State, addNewListAction } from "../store";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

const Button = styled.button`
  width: 200px;
  height: 40px;
  flex: 0 1 auto;
  border: 0;
  margin: 20px;
  border-radius: 10px;
  background: none;
  color: #fffa;
  border: 1px solid #fffa;
  cursor: pointer;
`;

const AddNewList = observer(() => {
  const dispatch = useDispatch();
  const listsCount = useSelector(
    (state: State) => Object.keys(state.list).length
  );
  const addNewList = useCallback(
    () => dispatch(addNewListAction(`List ${listsCount + 1}`)),
    [listsCount]
  );

  return <Button onClick={addNewList}>add new List</Button>;
});

export default AddNewList;
