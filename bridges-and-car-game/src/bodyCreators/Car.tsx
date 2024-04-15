import Matter from "matter-js";

export const createCar = (xx: number, yy: number, width: number, height: number, wheelSize: number) => {
    const Body = Matter.Body,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        Constraint = Matter.Constraint;

    const group = Body.nextGroup(true),
        wheelBase = 20,
        wheelAOffset = -width * 0.5 + wheelBase,
        wheelBOffset = width * 0.5 - wheelBase,
        wheelYOffset = 0;

    const car = Composite.create({ label: 'Car' })
    const body = Bodies.rectangle(xx, yy, width, height, { 
        collisionFilter: {
            group: group
        },
        chamfer: {
            radius: height * 0.5
        },
        density: 0.0002
    });

    const wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, { 
        collisionFilter: {
            group: group
        },
        render: {
            sprite: {
                texture: 'https://raw.githubusercontent.com/Violet022/Bridges-And-Car-Game/car-branch/bridges-and-car-game/src/img/car/wheel.png',
                xScale: 0.1,
                yScale: 0.1,  
            }
        },
        friction: 0.8
    });
                
    const wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, { 
        collisionFilter: {
            group: group
        },
        render: {
            sprite: {
                texture: 'https://opengameart.org/sites/default/files/styles/medium/public/SoccerBall_0.png',
                xScale: 0.4,
                yScale: 0.4,  
            }
        },
        friction: 0.8
    });
                
    const axelA = Constraint.create({
        bodyB: body,
        pointB: { x: wheelAOffset, y: wheelYOffset },
        bodyA: wheelA,
        stiffness: 1,
        length: 0
    });
                    
    const axelB = Constraint.create({
        bodyB: body,
        pointB: { x: wheelBOffset, y: wheelYOffset },
        bodyA: wheelB,
        stiffness: 1,
        length: 0
    });
    
    Composite.add(car, body);
    Composite.add(car, wheelA);
    Composite.add(car, wheelB);
    Composite.add(car, axelA);
    Composite.add(car, axelB);

    return car;
};
