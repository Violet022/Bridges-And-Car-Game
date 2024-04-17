import Matter from "matter-js";

const Body = Matter.Body,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Constraint = Matter.Constraint;
const startSpeed = 2;

enum ImgURL {
    WHEEL = 'https://raw.githubusercontent.com/Violet022/Bridges-And-Car-Game/main/bridges-and-car-game/src/img/car/wheel.png',
    CAR = 'https://raw.githubusercontent.com/Violet022/Bridges-And-Car-Game/main/bridges-and-car-game/src/img/car/car_frame.png'
}

// Функция расчета пройденного расстояния в зависимости от времени и ускорения
export const calcDist = (a: number, t: number) => {
    return (startSpeed * t) + ((a * t * t) / 2)
}

const getSprite = (texture: ImgURL, scale: number) => {
    return {
        texture: texture,
        xScale: scale,
        yScale: scale, 
    }
}
export const createCar = (xx: number, yy: number, width: number, height: number, wheelSize: number, carMass: number) => {
    const group = Body.nextGroup(true),
          wheelBase = 20,
          wheelAOffset = -width * 0.5 + wheelBase,
          wheelBOffset = width * 0.5 - wheelBase,
          wheelYOffset = 32;

    const wheelOptions = { 
        collisionFilter: { group: group },
        render: { sprite: getSprite(ImgURL.WHEEL, 0.2) },
        friction: 0.8
    }

    const car = Composite.create({ label: 'Car' })

    const body = Bodies.rectangle(xx, yy, width, height, { 
        collisionFilter: { group: group },
        render: { sprite: getSprite(ImgURL.CAR, 0.2) },
        density: 0.0002,
    });
    Body.setMass(body, carMass)

    const wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, wheelOptions);  
    const wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, wheelOptions);
                
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

    // Объект с функциями управления машиной путем нажатия на клавиатуре стрелки
    const keyHandlers = { 
        // "влево"
        ArrowLeft: (a: number, t: number = 1) => {
            Body.setPosition(body, {
                x: body.position.x - calcDist(a, t),
                y: body.position.y
            })
        },
        // "вверх"
        ArrowUp: (a: number, t: number = 1) => {
            Body.applyForce(body, 
                {x: body.position.x, y: body.position.y}, 
                {x: 0, y: -0.1}
            );
        },
        // "вправо"
        ArrowRight: (a: number, t: number = 1) => {
            Body.setPosition(body, {
                x: body.position.x + calcDist(a, t),
                y: body.position.y
            })
        },
    };

    return {car, keyHandlers};
};
