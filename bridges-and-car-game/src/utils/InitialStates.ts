import { IMatter, IModal } from "./Interfaces";

export const matterObjInitialState: IMatter = {
    render: null,
    runner: null,
    engine: null
}

export const modalInitialState: IModal = {
    isOpened: false, 
    gameResult: null
}