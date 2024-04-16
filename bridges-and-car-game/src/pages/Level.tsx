import { useRef, useState } from 'react';
import * as Matter from 'matter-js';
import { Input, Button, Form, Space, Select, Tooltip } from 'antd';

import './Level.css';

const { Option } = Select;

// Компонент Level, реализован с помощью Matter.js и частично с помощью chat GPT
const Level = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [bridgeLength, setBridgeLength] = useState<number>(10);
    const [density, setDensity] = useState<number>(0.005); // Установка значения по умолчанию
    const [frictionAir, setFrictionAir] = useState<number>(0.5); // Установка значения по умолчанию
    const [world, setWorld] = useState<Matter.World>();
    const [bridge, setBridge] = useState<Matter.Composite>();
    const [background, setBackground] = useState<string>('background1');

    const [AX, setAX] =useState<number>(240);
    const [AY, setAY] =useState<number>(410);
    
    const [BX, setBX] =useState<number>(960);
    const [BY, setBY] =useState<number>(410);

   // Обработчик клика на кнопку "Добавить мост"
   const handleClick = () => {
    if (world) {
            // Удаляем все существующие объекты из мира
            Matter.Composite.clear(world, false, true);

            //Добавление статических объектов
            Matter.Composite.add(world, [
                Matter.Bodies.rectangle(130, 590, 260, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#3f5669' } }),
                Matter.Bodies.rectangle(1070, 590, 260, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#3f5669' } })
            ]);
    
            setWorld(world);
            const group = Matter.Body.nextGroup(true);

            // Создаем мост
            const bridgeLengthValue = bridgeLength || 10;
            const bridge = Matter.Composites.stack(160, 290, bridgeLengthValue, 1, 0, 0, (x: number, y: number) => {
                return Matter.Bodies.rectangle(x - 20, y, 53, 20, {
                    collisionFilter: { group: group },
                    chamfer: 5 as Matter.IChamfer,
                    density: density,
                    frictionAir: frictionAir,
                    render: { fillStyle: '#3f4269' }
                });
            });

            Matter.Composites.chain(bridge, 0.3, 0, -0.3, 0, { stiffness: 0.99, length: 0.0001, render: { visible: false } });

            Matter.Composite.add(world, [
                bridge,
                Matter.Constraint.create({ pointA: { x: AX, y: AY }, bodyB: bridge.bodies[0], pointB: { x: -25, y: 0 }, length: 2, stiffness: 0.9 }),
                Matter.Constraint.create({ pointA: { x: BX, y: BY }, bodyB: bridge.bodies[bridge.bodies.length - 1], pointB: { x: 25, y: 0 }, length: 2, stiffness: 0.9 })
            ]);
            setBridge(bridge);
        }
    };

    // Функция для создания мира и объектов
    const createWorld = () => {
        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Composite = Matter.Composite,
            Bodies = Matter.Bodies;

        const engine = Engine.create();
        const world = engine.world;

        const render = Render.create({
            element: containerRef.current!,
            engine: engine,
            options: {
                width: 1200,
                height: 700,
                background: '',
                wireframes: false,
                pixelRatio: window.devicePixelRatio,
            }
        });

        Render.run(render);

        const runner = Runner.create();
        Runner.run(runner, engine);

        //Добавление статических объектов
        Composite.add(world, [
            Bodies.rectangle(130, 590, 260, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#3f5669' } }),
            Bodies.rectangle(1070, 590, 260, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#3f5669' } })
        ]);

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

    return (
        <Space direction="horizontal" className="main-space">
            <Space direction="vertical" className="control-space">
                <Form.Item label="Выбрать уровернь">
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
            </Space>
            <div ref={containerRef} className={`bridge-container ${world ? background : ''}`}></div>
        </Space>
    );
};

export default Level;