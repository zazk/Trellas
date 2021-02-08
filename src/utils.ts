export const uniqid = () =>
  (Math.random() * new Date().getTime()).toString(16).replace(".", "");

export enum ItemTypes {
  CARD = "CARD"
}
