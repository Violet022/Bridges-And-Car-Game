import Matter from "matter-js";

const Body = Matter.Body,
      Composite = Matter.Composite

export const CarManipulations = {
    // Функция обновления машины при обновлении моста
    updateWhileBridgeUpdating: (world: Matter.World, currentCar: Matter.Composite | undefined): Matter.Composite => {
        let newCar: Matter.Composite;
        if (currentCar) {
            let newBodies = [...currentCar.bodies];
            Body.setPosition(newBodies[0], {
                x: newBodies[0].position.x,
                y: newBodies[0].position.y - 100
            })
            newCar = {...currentCar, bodies: newBodies}
        } else newCar = {} as Matter.Composite
        Composite.remove(world, currentCar!);
        Composite.add(world, newCar);

        return newCar;
    },
    // Функция изменения массы машины
    updateMass: (world: Matter.World, newMass: number, car: Matter.Composite): Matter.Composite => {
        const newCar: Matter.Composite = {...car};
        Body.setMass(newCar.bodies[0], newMass);
        Composite.remove(world, car);
        Composite.add(world, newCar);

        return newCar
    },
    // Функция проверки того, находится ли объект за границами экрана
    isCarBeyondBoundaries: (car: Matter.Composite, width: number, height: number): boolean => {
        const x = car.bodies[0].position.x;
        const y = car.bodies[0].position.y;

        return x < 0 || x > width || y < 0 || y > height;
    },
    // Функция проверки того, достигла ли машина противоположного берега
    isCarOnTheOtherShore: (car: Matter.Composite, xShore: number, yShore: number): boolean => {
        const x = car.bodies[0].position.x;
        const y = car.bodies[0].position.y;

        return x > xShore &&  y < yShore;
    }
}