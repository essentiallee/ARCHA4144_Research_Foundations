//JavaScript finidng elements created in index

const canvas = document.querySelector("#field");
const context = canvas.getContext("2d");

const prompt = document.querySelector("#prompt");
const clearButton = document.querySelector("#clearButton");
const counter = document.querySelector("#counter");

//Calling 2d functions in Java
canvas.getContext("2d");

//Create two canvanses to achieve bleeding effect and color effect
//way to generate watercolor dropping on water puddle

const pigmentCanvas = document.createElement("cnanvas");
const pigmentContext = pigmentCanvas.getContext("2d");

const bleedCanvas = document.createElement("canvas");
const bleedContext = bleedCanvas.getContext("2d");

//Defining the color palette
const palette = [
  [243, 60, 58],
  [22, 26, 16],
  [128, 155, 64],
  [247, 176, 55],
  [104, 93, 183],
  [253, 246, 230],
];

//Creating the storage arrays for random walker variable
//walkers = moving points that leave trails
//blooms = watercolor strains that gorw around landing points
//connections = lines drawn between nearby nodes
const walker = [];
const blooms = [];
const connections = [];

//Measurements and counters
//variables to keep tract of the design in the browser
let width = window.innerWidth;
let height = window.innerHeight;
let pixelRatio = 1;
let nodeCount = 0;
let previousTime = performance.now();

//Random number generator: CORE FUNCTION
function random(min = 0, max = 1) {
  return min + Math.random() * (max - min);
}

//the const palette stores colors, but the canvas needs CSS color text!
//alpha controls transparency, gets more transparent below '1'
function rgba(color, alpha) {
  return 'rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})';
}

//This chooses a random position in palette
//retruning color's index, not the color itself
function chooseColor(differnetFrom = -1) {
  let index = Math.floor(random(0, palette.length));

  if (index === differnetFrom) {
    index = 
      (index + 1 + Math.floor(random(0, palette.length -1)))
      % palette.length; //makes the index wrap around if it passes the end of the palette
  }

  return index;
}

//RESIZING THE CANVAS!!: css makes the canvas fill the browser, but JavaScript must also set its internal drawing
//the line limiting ratio to 2 is grabbed from internet, based on Retina screen
//A retina screen might have a pixel ratio of 2, meaning a 1000 pixel browser may need a 2000 pixel wide canvas to reamin clean.
function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;

  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  for (const surface of [canvas, pigmentCanvas, bleedCanvas]) {
    surface.width = Math.floor(width * pixelRatio);
    surface.height = Math.floor(height * pixelRatio);

    const surfaceConext = surface.getContext("2d"); //need to call it again

    surfaceConext.setTransform(
      pixelRatio,
      0,
      0,
      pixelRatio,
      0,
      0
    );
  }

  claerArtwork();
}

//This function chooses the path and the distance of the random destination
function makeTarget(x, y, distance = random(55, 180)) {
  const angle = random(0, Math.PI * 2);
  const margin = 24;

//the function starts from the 'walker''s current point - x and y
//chhose random angle, distance between 55, 180 like set above, the full circle in radians is math.pi *2
//x or y + cosin or sin to distance converts angle into a new position:
  return {
    x: Math.max(
      margin,
      Math.min(width - margin, x + Math.cos(angle) * distance)
    ),

    y: Math.max(
      margin,
      Math.min(height -  margin, y + Math.sin(angle) * distance)
    ),
  };
}

//Finally Creating a WALKER
function createWalker(
  x,
  y,
  colorIndex,
  generation = 0,
  angle = random(0, Math.PI * 2)
) {
  if (walker.length >= 260) return; //safe to have a limit, otherwise the browser might freeze from calculating too much

  //previous position is needed to draw a line from the last location to the new one.
  walkers.push({
    x,
    y,
    previousX: x,
    previousY: y,

    //walker's movement direction and speed
    velocityX: Math.cos(angle) * random(0.25, 0.8),
    velocityY: Math.sin(angle) * random(0.25, 0.8),

    //each walker gets a random destination target
    target: makeTarget(x, y),

    colorIndex,
    generation,

    age: 0, //generation = 0 which means their children generation 1, then 2 ...

    maxAge: //walker cannot go forever; must have destination (max Age)
      random(150, 410) *
      Max.max(0.55, 1 - generation * 0.06),

    //each walker receives a slightly different width and movement instability (detail to the design!)
    lineWidth: random(0.45, 1.35),
    wobble: random(0.045, 0.13),

    landed: false,
  });
}

//Creating a BLOOM
//same logic as the walker; define coordinates, randdom generation set boundaries
function createBloom(x, y, colorIndex, strength = 1) {
  blooms.push({
    x,
    y,
    colorIndex,
    age: 0,
    maxAge: random(90, 180),
    radius: random(7, 16) * strength,
    rings: Math.floor(random(5, 10)),
  });
}

//responding to FIRST CLICK!
function startAT(x, y) {
  prompt.classList.add("hidden");
  clearButton.classList.add("visible");
  counter.classList.add("visible");

  const firstColor = chooseColor(); //defined earlier for choosing random color
  const numberOfRoots = Math.floor(random(4, 8));

  createBloom(x, y, firstColor, 1.7); //this makes the origianl click visually stronger than the later ones
  nodeCount += 1;

  for (let index = 0; index < numberOfRoots; index += 1) {
    const color = 
      index === 0
        ? firstColor //ai troubleshoot
        : chooseColor(firstColor); //ai troubleshoot

    const angle =
      (Math.PI * 2 * index) / numberOfRoots +
      random(-0.45, 0.45);

    createWalker(x, y, color, 0, angle);
  }

  updateCounter();
}