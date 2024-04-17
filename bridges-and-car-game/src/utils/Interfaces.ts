export interface IModal {
    isOpened: boolean,
    gameResult: 'SUCCESS' | 'FAIL' | null
}

export interface IMatter {
    render: Matter.Render | null
    runner: Matter.Runner | null,
    engine: Matter.Engine | null
}