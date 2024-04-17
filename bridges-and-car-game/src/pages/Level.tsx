import { useEffect, useRef, useState } from 'react';
import * as Matter from 'matter-js';
import { Input, Button, Form, Space, Select, Tooltip, Typography, Modal } from 'antd';
import { createCar } from '../objects/Car/CarCreator';

import './Level.css';
import { CarManipulations } from '../objects/Car/CarManipulations';
import { IMatter, IModal } from '../utils/Interfaces';
import { matterObjInitialState, modalInitialState } from '../utils/InitialStates';

const { Option } = Select;
const { Title } = Typography;
const Engine = Matter.Engine,
      Render = Matter.Render,
      Body = Matter.Body,
      Runner = Matter.Runner,
      Composites = Matter.Composites,
      Composite = Matter.Composite,
      Constraint = Matter.Constraint,
      Bodies = Matter.Bodies,
      Events = Matter.Events;
const scale = 0.8;

// Компонент Level, реализован с помощью Matter.js и частично с помощью chat GPT
const Level = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [background, setBackground] = useState<string>('background1');
    const [world, setWorld] = useState<Matter.World>();
    const [bridge, setBridge] = useState<Matter.Composite>();
    const [car, setCar] = useState<Matter.Composite | null>();
    const [matterObj, setMatterObj] = useState<IMatter>(matterObjInitialState);

    const [bridgeLength, setBridgeLength] = useState<number>(10);
    const [density, setDensity] = useState<number>(0.005); // Установка значения по умолчанию
    const [frictionAir, setFrictionAir] = useState<number>(0.5); // Установка значения по умолчанию

    const [AX, setAX] =useState<number>(240);
    const [AY, setAY] =useState<number>(410);
    
    const [BX, setBX] =useState<number>(960);
    const [BY, setBY] =useState<number>(410);

    const [time, setTime] = useState<number>(1);
    const [acceleration, setAcceleration] = useState<number>(0.5);
    const [mass, setMass] = useState<number>(50);

    const [modal, setModal] = useState<IModal>(modalInitialState)

    const keysDown = new Set();

    useEffect(() => {
        function handleKeyUpAndDown(event: KeyboardEvent, type: 'ADD' | 'REMOVE') {
            type === 'ADD' ? keysDown.add(event.code) : keysDown.delete(event.code)
        }

        document.addEventListener("keydown", (e) => {handleKeyUpAndDown(e, 'ADD')});
        document.addEventListener("keyup", (e) => {handleKeyUpAndDown(e, 'REMOVE')});

        return () => {
            document.removeEventListener("keydown", (e) => {handleKeyUpAndDown(e, 'ADD')});
            document.removeEventListener("keyup", (e) => {handleKeyUpAndDown(e, 'REMOVE')})
        }
    }, [])

   // Обработчик клика на кнопку "Добавить мост"
    const handleClick = () => {
        if (world) {
            if (bridge) Composite.remove(world, bridge)
            const group = Body.nextGroup(true);

            // Создаем мост
            const bridgeLengthValue = bridgeLength || 10;
            const newBridge = Composites.stack(160, 290, bridgeLengthValue, 1, 0, 0, (x: number, y: number) => {
                return Bodies.rectangle(x - 20, y, 53, 20, {
                    collisionFilter: { group: group },
                    chamfer: 5 as Matter.IChamfer,
                    density: density,
                    frictionAir: frictionAir,
                    render: { fillStyle: '#3f4269' }
                });
            });

            Composites.chain(newBridge, 0.3, 0, -0.3, 0, { stiffness: 0.99, length: 0.0001, render: { visible: false } });

            Composite.add(world, [
                newBridge,
                Constraint.create({ pointA: { x: AX, y: AY }, bodyB: newBridge.bodies[0], pointB: { x: -25, y: 0 }, length: 2, stiffness: 0.9 }),
                Constraint.create({ pointA: { x: BX, y: BY }, bodyB: newBridge.bodies[newBridge.bodies.length - 1], pointB: { x: 25, y: 0 }, length: 2, stiffness: 0.9 })
            ]);

            const newCar: Matter.Composite = CarManipulations.updateWhileBridgeUpdating(world, car!);

            setBridge(newBridge);
            setCar(newCar);
            setWorld(world)
        }
    };

    // Обработчик клика на кнопку "Обновить настройки машины"
    const handleCarUpdateClick = () => {
        if (world && car) setCar(CarManipulations.updateMass(world, mass, car))
    }

    // Функция для создания мира и объектов
    const createWorld = () => {
        const engine = Engine.create();
        const runner = Runner.create();
        const render = Render.create({
            element: containerRef.current!,
            engine: engine,
            options: {
                width: 1200,
                height: 700,
                background: '',
                wireframes: false,
                pixelRatio: window.devicePixelRatio,
            },
        });
        setMatterObj({
            render: render,
            runner: runner,
            engine: engine,
        })
        const world = engine.world;

        const {car, keyHandlers} = createCar(125, 436, 150 * scale, 40 * scale, 28 * scale, mass);
        setCar(car);

        Events.on(runner, "tick", event => {
            const curTime = Math.floor(Number(event.timestamp / 1000));
            if (curTime !== time) setTime(curTime);
        });
        Events.on(engine, "beforeUpdate", event => {
            for (const key of keysDown) {
                keyHandlers[key as keyof typeof keyHandlers]?.(acceleration, time);
            }
            if (CarManipulations.isCarBeyondBoundaries(car, 1200, 700)) {
                if (car !== null) {
                    Composite.remove(world, car);
                    setCar(null);
                    if (!modal.isOpened) setModal({isOpened: true, gameResult: 'FAIL'});
                }
            }
            if (CarManipulations.isCarOnTheOtherShore(car, 1070, 380)) {
                setModal({isOpened: true, gameResult: 'SUCCESS'});
            }
        });

        Render.run(render);
        Runner.run(runner, engine);

        //Добавление статических объектов
        Composite.add(world, [
            Bodies.rectangle(130, 590, 260, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#3f5669' } }),
            Bodies.rectangle(1070, 590, 260, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#3f5669' } }),
            Bodies.rectangle(10, 150, 20, 700, { isStatic: true, render: { fillStyle: 'transparent'}})
        ]);
        Composite.add(world, car)

        setWorld(world);

        return { engine, world, render, runner };
    };

    // Обработчик клика на кнопку "Начать"
    const handleCreateWorldClick = () => {
        // При клике на кнопку "Создать мир" вызываем функцию createWorld для создания нового мира
        createWorld();
    };

    // Обработчик клика на кнопку измененить фон
    const handleBackgroundChange = (value: string) => {
        setBackground(value);
    };

    // Обработчик рестарта
    const handleRestart = () => {
        setModal(modalInitialState)
        if (world) {
            Render.stop(matterObj.render!);
            Runner.stop(matterObj.runner!);
            setMatterObj(matterObjInitialState);
            Composite.clear(world, false, true);
            createWorld();
        }
    }

    return (
        <Space direction="horizontal" className="main-space">
            <Space direction="vertical" className="control-space">
                <Form.Item label="Выбрать уровень">
                    <Select value={background} onChange={handleBackgroundChange}>
                        <Option value="background1">Уровень 1</Option>
                        <Option value="background2">Уровень 2</Option>
                        <Option value="background3">Уровень 3</Option>
                        <Option value="background4">Уровень 4</Option>
                    </Select>
                </Form.Item>
                <div style={{ borderTop: '1px solid #3f4269', paddingTop: 23 }}>
                    <Form.Item hidden={!!world}>
                        <Button type="primary" onClick={handleCreateWorldClick} disabled={!!world} style={{ background: '#3f4269' }}>Начать</Button>
                    </Form.Item>
                    <Title hidden={!world} level={5} style={{margin: '0px 0px 10px 0px', color: '#3f4269'}}>Настройки моста</Title>
                    <Tooltip title="Количество элементов в мосту">
                        <Form.Item hidden={!world} label="Длина моста">
                            <Input type="number" value={bridgeLength} onChange={(e) => setBridgeLength(Number(e.target.value))} />
                        </Form.Item>
                    </Tooltip>
                    <Tooltip title="Плотность каждого из брусков, составляющих мост. Плотность влияет на массу каждого бруска и, следовательно, на его инерцию и устойчивость">
                        <Form.Item hidden={!world} label="Плотность">
                            <Input type="number" value={density} min={0.001} max={10000} step={0.001} onChange={(e) => setDensity(Number(e.target.value))} />
                        </Form.Item>
                    </Tooltip>
                    <Tooltip title="Коэффициент трения воздуха, который определяет сопротивление воздуха, оказываемого на каждый брусок моста, 0 означает отсутствие сопротивления и 1 означает максимально возможное сопротивление">
                        <Form.Item hidden={!world} label="Коэффициент трения воздуха">
                            <Input type="number" value={frictionAir} min={0} max={1} step={0.01} onChange={(e) => setFrictionAir(Number(e.target.value))} />
                        </Form.Item>
                    </Tooltip>
                    <div style={{ display: 'flex', gap: 24 }}>
                        <div>
                            <Tooltip title="Координата X у левого конца моста">
                                <Form.Item hidden={!world} label="X">
                                    <Input type="number" value={AX} onChange={(e) => setAX(Number(e.target.value))} />
                                </Form.Item>
                            </Tooltip>
                            <Tooltip title="Координата Y у левого конца моста">
                                <Form.Item hidden={!world} label="Y">
                                    <Input type="number" value={AY} onChange={(e) => setAY(Number(e.target.value))} />
                                </Form.Item>
                            </Tooltip>
                        </div>
                        <div>
                            <Tooltip title="Координата X у правого конца моста">
                                <Form.Item hidden={!world} label="X">
                                    <Input type="number" value={BX} onChange={(e) => setBX(Number(e.target.value))} />
                                </Form.Item>
                            </Tooltip>
                            <Tooltip title="Координата Y у правого конца моста">
                                <Form.Item hidden={!world} label="Y">
                                    <Input type="number" value={BY} onChange={(e) => setBY(Number(e.target.value))} />
                                </Form.Item>
                            </Tooltip>
                        </div>
                    </div>
                    <Form.Item hidden={!world}>
                        <Button type="primary" onClick={handleClick} style={{ background: '#3f4269' }}>{`${bridge ? 'Обновить' : 'Добавить'}`} мост</Button>
                    </Form.Item>
                </div>
                <div style={{ paddingTop: 23 }}>
                    <Title hidden={!world} level={5} style={{margin: '0px 0px 10px 0px', color: '#3f4269'}}>Настройки машины</Title>
                    <Tooltip title="Масса машины">
                        <Form.Item hidden={!world} label="Масса">
                            <Input type="number" value={mass} onChange={(e) => setMass(Number(e.target.value))} />
                        </Form.Item>
                    </Tooltip>
                    <Tooltip title="Величина, определяющая ускорение машины при равноускоренном движении">
                        <Form.Item hidden={!world} label="Ускорение">
                            <Input type="number" value={acceleration} min={0.5} max={100} step={0.1} onChange={(e) => setAcceleration(Number(e.target.value))} />
                        </Form.Item>
                    </Tooltip>
                    <Form.Item hidden={!world}>
                        <Button type="primary" disabled={!car} onClick={handleCarUpdateClick} style={{ background: '#3f4269' }}>Обновить настройки машины</Button>
                    </Form.Item>
                </div>
            </Space>
            <div ref={containerRef} className={`bridge-container ${world ? background : ''}`}></div>
            <Modal
                open={modal.isOpened}
                title={modal!.gameResult === 'SUCCESS'? 'Поздравляем!' : 'Увы...'}
                onCancel={() => setModal({isOpened: false, gameResult: null})}
                footer={() => (
                <>
                    <Button onClick={() => setModal({isOpened: false, gameResult: null})}>Нет</Button>
                    <Button type="primary" onClick={handleRestart} style={{ background: '#3f4269' }}>Да</Button>
                </>
                )}
            >
                <p>{modal!.gameResult === 'SUCCESS'? 'Вы успешно преодолели мост.' : 'Вы не смогли преодолеть мост.'}</p>
                <p>Желаете начать игру занаво?</p>
            </Modal>
        </Space>
    );
};

export default Level;