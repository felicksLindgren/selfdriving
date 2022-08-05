const roadCanvas = document.getElementById('road');
roadCanvas.width = 200;

const networkCanvas = document.getElementById('network');
networkCanvas.width = 400;

const roadCtx = roadCanvas.getContext('2d');
networkCtx = networkCanvas.getContext('2d');

const road = new Road(roadCanvas.width / 2, roadCanvas.width * 0.9);

const N = 100;
const cars = genarateCars(N);
let bestCar = cars[0];

if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));

        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.2);
        }
    }
}

const traffic = [];

for (let i = 0; i < 35; i++) {
    traffic.push(
        new Car(road.getLaneCenter(Math.floor(Math.random() * (3 - 0) + 0)), -(i * 125), 30, 50, "DUMMY", 1.5)
    )
}

animate();

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function genarateCars(N) {
    const cars = [];
    for (let i = 0; i < N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }

    return cars;
}

function animate(time) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    bestCar = cars.find(c => c.y == Math.min(...cars.map(c => c.y)));

    roadCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    roadCtx.save();
    roadCtx.translate(0, -bestCar.y + roadCanvas.height * 0.7);

    road.draw(roadCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(roadCtx, "red");
    }
    roadCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(roadCtx, "blue");
    }
    roadCtx.globalAlpha = 1;
    bestCar.draw(roadCtx, "blue", true);

    roadCtx.restore();

    // networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}