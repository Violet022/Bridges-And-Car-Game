import { useEffect, useRef, useState } from 'react';
import * as Matter from 'matter-js';
import { Input, Button, Form, Space, Select } from 'antd';
import { createCar } from '../bodyCreators/Car';

import './Level.css';
import { createCanvas } from 'canvas';

const { Option } = Select;
const Engine = Matter.Engine,
      Render = Matter.Render,
      Body = Matter.Body,
      Runner = Matter.Runner,
      Composites = Matter.Composites,
      Composite = Matter.Composite,
      Constraint = Matter.Constraint,
      Bodies = Matter.Bodies;

// Компонент Level, реализован с помощью Matter.js и частично с помощью chat GPT
const Level = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [bridgeLength, setBridgeLength] = useState<number>(10);
    const [density, setDensity] = useState<number>(0.005); // Установка значения по умолчанию
    const [frictionAir, setFrictionAir] = useState<number>(0.5); // Установка значения по умолчанию
    const [world, setWorld] = useState<Matter.World>();
    const [br, setBridge] = useState<Matter.Composite>();
    const [background, setBackground] = useState<string>('background1');

    const [AX, setAX] =useState<number>(240);
    const [AY, setAY] =useState<number>(410);
    
    const [BX, setBX] =useState<number>(960);
    const [BY, setBY] =useState<number>(410);

    useEffect(() => {
        console.log(world)
    }, [world])

   // Обработчик клика на кнопку "Добавить мост"
   const handleClick = () => {
        if (world) {
            // Удаляем все существующие объекты из мира
            // Composite.clear(world, false, true);

            //Добавление статических объектов
            // Composite.add(world, [
            //     Bodies.rectangle(130, 590, 260, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#3f5669' } }),
            //     Bodies.rectangle(1070, 590, 260, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#3f5669' } })
            // ]);
    
            // setWorld({...world});
            if(br) Composite.remove(world, br)
            const group = Body.nextGroup(true);

            // Создаем мост
            const bridgeLengthValue = bridgeLength || 10;
            const bridge = Composites.stack(160, 290, bridgeLengthValue, 1, 0, 0, (x: number, y: number) => {
                return Bodies.rectangle(x - 20, y, 53, 20, {
                    collisionFilter: { group: group },
                    chamfer: 5 as Matter.IChamfer,
                    density: density,
                    frictionAir: frictionAir,
                    render: { fillStyle: '#3f4269' }
                });
            });

            Composites.chain(bridge, 0.3, 0, -0.3, 0, { stiffness: 0.99, length: 0.0001, render: { visible: false } });

            Composite.add(world, [
                bridge,
                Constraint.create({ pointA: { x: AX, y: AY }, bodyB: bridge.bodies[0], pointB: { x: -25, y: 0 }, length: 2, stiffness: 0.9 }),
                Constraint.create({ pointA: { x: BX, y: BY }, bodyB: bridge.bodies[bridge.bodies.length - 1], pointB: { x: 25, y: 0 }, length: 2, stiffness: 0.9 })
            ]);
            Composite.add(world, createCar(400, 100, 150 * 0.8, 30 * 0.8, 30 * 0.8))
            setBridge(bridge);
            setWorld({...world})
        }
    };

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
                showAngleIndicator: true,
                showCollisions: true
            },
        });
        render.canvas = render.canvas || createCanvas(1200, 700);
        
        const world = engine.world;

        Render.run(render);
        Runner.run(runner, engine);

        //Добавление статических объектов
        Composite.add(world, [
            Bodies.rectangle(130, 590, 260, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#3f5669' } }),
            Bodies.rectangle(1070, 590, 260, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#3f5669' } })
        ]);

        const scale = 0.8;
        Composite.add(world, createCar(400, 100, 150 * scale, 30 * scale, 30 * scale))

        const ball = Bodies.circle(90, 280, 20, {
            render: {
              sprite: {
                texture: "https://opengameart.org/sites/default/files/styles/medium/public/SoccerBall_0.png",
                xScale: 0.4,
                yScale: 0.4
              }
            }
          });
          Composite.add(world, ball)

        setWorld(world);

        const mouse = Matter.Mouse.create(render.canvas)
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

        Composite.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
        render.mouse = mouse;

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
                    <Form.Item hidden={!world} label="Длина моста">
                        <Input type="number" value={bridgeLength} onChange={(e) => setBridgeLength(Number(e.target.value))} />
                    </Form.Item>
                    <Form.Item hidden={!world} label="Плотность">
                        <Input type="number" value={density} min={0.001} max={10000} step={0.001} onChange={(e) => setDensity(Number(e.target.value))} />
                    </Form.Item>
                    <Form.Item hidden={!world} label="Коэффициент трения воздуха">
                        <Input type="number" value={frictionAir} min={0} max={1} step={0.01} onChange={(e) => setFrictionAir(Number(e.target.value))} />
                    </Form.Item>
                    <div style={{ display: 'flex', gap: 24 }}>
                        <div>
                            <Form.Item hidden={!world} label="X">
                                <Input type="number" value={AX} onChange={(e) => setAX(Number(e.target.value))} />
                            </Form.Item>
                            <Form.Item hidden={!world} label="Y">
                                <Input type="number" value={AY} onChange={(e) => setAY(Number(e.target.value))} />
                            </Form.Item>
                        </div>
                        <div>
                            <Form.Item hidden={!world} label="X">
                                <Input type="number" value={BX} onChange={(e) => setBX(Number(e.target.value))} />
                            </Form.Item>
                            <Form.Item hidden={!world} label="Y">
                                <Input type="number" value={BY} onChange={(e) => setBY(Number(e.target.value))} />
                            </Form.Item>
                        </div>
                    </div>
                    <Form.Item hidden={!world}>
                        <Button type="primary" onClick={handleClick} style={{ background: '#3f4269' }}>{`${br ? 'Обновить' : 'Добавить'}`} мост</Button>
                    </Form.Item>
                </div>
            </Space>
            <div ref={containerRef} className={`bridge-container ${world ? background : ''}`}></div>
        </Space>
    );
};

export default Level;