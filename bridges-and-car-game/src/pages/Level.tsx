import { useRef, useState } from 'react';
import * as Matter from 'matter-js';
import { Input, Button, Form, Space } from 'antd';

import './Level.css';

// Компонент Level, реализован с помощью Matter.js и частично с помощью chat GPT
const Level = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [bridgeLength, setBridgeLength] = useState<number>(0);
    const [density, setDensity] = useState<number>(0.005); // Установка значения по умолчанию
    const [frictionAir, setFrictionAir] = useState<number>(0.1); // Установка значения по умолчанию
    const [world, setWorld] = useState<Matter.World>();

   // Обработчик клика на кнопку "Добавить мост"
   const handleClick = () => {
    if (world) {
            // Удаляем все существующие объекты из мира
            Matter.Composite.clear(world, false, true);

            //Добавление статических объектов
            Matter.Composite.add(world, [
                Matter.Bodies.rectangle(130, 590, 220, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#505050' } }),
                Matter.Bodies.rectangle(1070, 590, 220, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#505050' } })
            ]);
    
            setWorld(world);
            const group = Matter.Body.nextGroup(true);

            // Создаем новый мир и объекты
            const bridgeLengthValue = bridgeLength || 10;
            const bridge = Matter.Composites.stack(160, 290, bridgeLengthValue, 1, 0, 0, (x: number, y: number) => {
                return Matter.Bodies.rectangle(x - 20, y, 53, 20, {
                    collisionFilter: { group: group },
                    chamfer: 5 as Matter.IChamfer,
                    density: density,
                    frictionAir: frictionAir,
                    render: { fillStyle: '#000000' }
                });
            });

            Matter.Composites.chain(bridge, 0.3, 0, -0.3, 0, { stiffness: 0.99, length: 0.0001, render: { visible: false } });

            Matter.Composite.add(world, [
                bridge,
                Matter.Constraint.create({ pointA: { x: 240, y: 410 }, bodyB: bridge.bodies[0], pointB: { x: -25, y: 0 }, length: 2, stiffness: 0.9 }),
                Matter.Constraint.create({ pointA: { x: 960, y: 410 }, bodyB: bridge.bodies[bridge.bodies.length - 1], pointB: { x: 25, y: 0 }, length: 2, stiffness: 0.9 })
            ]);
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
                background: "#bdd6ff",
                wireframes: false,
                pixelRatio: window.devicePixelRatio,
            }
        });

        Render.run(render);

        const runner = Runner.create();
        Runner.run(runner, engine);

        //Добавление статических объектов
        Composite.add(world, [
            Bodies.rectangle(130, 590, 220, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#505050' } }),
            Bodies.rectangle(1070, 590, 220, 380, { isStatic: true, chamfer: { radius: 20 }, render: { fillStyle: '#505050' } })
        ]);

        setWorld(world);

        return { engine, world, render, runner };
    };

    // Обработчик клика на кнопку "Начать"
    const handleCreateWorldClick = () => {
        // При клике на кнопку "Создать мир" вызываем функцию createWorld для создания нового мира
        createWorld();
    };

    return (
        <Space direction="horizontal" className="main-space">
            <Space direction="vertical" className="control-space">
                <Form.Item hidden={!!world}>
                    <Button type="primary" onClick={handleCreateWorldClick} disabled={!!world}>Начать</Button>
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
                <Form.Item hidden={!world}>
                    <Button type="primary" onClick={handleClick}>Добавить мост</Button>
                </Form.Item>
            </Space>
            <div ref={containerRef} className="bridge-container"></div>
        </Space>
    );
};

export default Level;