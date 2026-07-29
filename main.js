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

const pigmentCanvas = document.createElement("canvas");
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
const walkers = [];
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
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
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

  clearArtwork();
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
      Math.max(0.55, 1 - generation * 0.06),

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
function startAt(x, y) {
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

//Painting a Trail
//this function gets color and calculates the walker's speed
function paintTrail(walker) {
  const color = palette[walker.colorIndex];
  const speed = Math.hypot(walker.velocityX, walker.velocityY); //defined in createWalker function

  //Soft Stroke
  bleedContext.beginPath();
  bleedContext.moveTo(walker.previousX, walker.previousY);
  bleedContext.quadraticCurveTo(
    (walker.previousX + walker.x) / 2 + random(-1.4, 1.4),
    (walker.previousY + walker.y) / 2 + random(-1.4, -1.4),
    walker.x,
    walker.y
  );
  bleedContext.strokeStyle = rgba(color, 0.018);
  bleedContext.lineWidth = walker.lineWidth * 10 + speed * 2;
  bleedContext.stroke();

  //Sharp Stroke
  pigmentContext.beginPath();
  pigmentContext.moveTo(walker.previousX, walker.previousY);
  pigmentContext.lineTo(walker.x, walker.y);
  pigmentContext.strokeStyle = rgba(color, random(0.045, 0.11));
  pigmentContext.lineWidth = walker.lineWidth * random(0.7, 1.5);
  pigmentContext.stroke();

  //Random fibers
  if (Math.random() < 0.24) {
    //Draw another faint, offset line
  };
}

//Landing and Branching
function landWalker(walker) {
  if (walker.landed) return;

  walker.landed = true; //when a walker lands, it is marked as finished
  nodeCount += 1; //node counter increases

  createBloom(
    walker.x,
    walker.y,
    walker.colorIndex,
    random(0.65, 1.2)
  ); //a bloom is created

  //early generations produce 2 - 3 branches; lather ones produce 1 - 2
  //rapid initial growth (preivous) to gradually slowing down
  const branchCount = 
    walker.generation < 3
      ? Math.floor(random(2, 4))
      : Math.floor(random(1, 3));

  //Color Mutation
  const shouldChangeColor = 
    Math.random() < 0.52; //each child has a 52% chance of changing color

  const nextColor = shouldChangeColor
    ? chooseColor(walker.colorIndex)
    : walker.colorIndex;
  
  //Generation Limit
  if (walker.generation < 7 && walkers.length < 240) {
    // Create the next generation here
  }
}

//Connecting nearby Blooms
function connectToNearbyBloom(walker) {
  const candidates = blooms.slice(0, -1).slice(-50);
  //the script examines up to 50 recent blooms
  let nearest = null;
  let nearestDistance = 220;

  const distance = Math.hypot(
    blooms.x - walker.x,
    blooms.y - walker.y
  );

  //if it finds a nearbyBloom, it may create a connection
  //70% chance
  if (nearest && Math.random() < 0.70) {
    connections.push({
      startX: walker.x,
      startY: walker.y,
      endX: nearest.x,
      endY: nearest.y,
      startColor: walker.colorIndex,
      endColor: nearest.colorIndex,
      progress: 0,
    });
  }
}

//Moving the walkers
//MAIN RANDOM-WALK CALCULATION:
function updateWalker(walker, frameScale) {
  //draw a line between the OLD and NEW positions
  walker.previousX = walker.x;
  walker.previousY = walker.y;

  //Find the direction to the target
  //calculating the differneces between the current position and destination
  const differenceX = walker.target.x - walker.x;
  const differenceY = walker.target.y - walker.y;
  const distance = Math.hypot(differenceX, differenceY) || 1;
  
  //Apply Attraction
  //dividing by 'distance' creates a direction with a consistent lenght
  //'attraction' gently pulls the walker toward its target
  walker.velocityX +=
    (differenceX / distance) * attraction * frameScale;
  
  walker.velocityY +=
    (differenceY / distance) * attraction * frameScale;

  const randomTurn = 
    random(-walker.wobble, walker.wobble) * frameScale;
  
  const rotatedX = 
    walker.velocityX * cosine -
    walker.velocityY * sin;

  const rotatedY =
    walker.velocityX * sin +
    walker.velocityY * cosine;
  
  //apply friction
  walker.velocityX = rotatedX * 0.985;
  walker.velocityY = rotatedY * 0.985;

  //limit spped
  if (speed > maximumSpeed) {
    //Reduce velocity to maximumSpeed
  }

  //Move
  walker.x += walker.velocityX * frameScale;
  walker.y += walker.velocityY * frameScale;

  paintTrail(walker);

  if (distance < 8 || walker.age >= walker.maxAge) {
    landWalker(walker);
  }
}

//Growing Blooms
function paintBloom(bloom, frameScale) {
  const progress = 
    Math.min(1, bloom.age / bloom.maxAge);
  
  const easedProgres = 
    1 - Math.pow(1 - progress, 3);
  //This makes the bloom expand quickly at first, then slow down near the end
  //several circles are placed around its center with random. size and offsets
  //the opacity is low but accumulates across many frames
}

//Drawing Network Connections
function paintConnection(connection, frameScale) {
  connection,progress = Math.min(
    1,
    connection.progress + 0.014 * frameScale
  );
  //when progress is 0 = none of the line is visible, 1 = the complete line is visible
  const gradient = 
    pigmentContext.createLinearGradient(
      (walker.previousX + walker.x) / 2 + random(-1.4, 1.4),
      (walker.previousY + walker.y) / 2 + random(-1.4, 1.4),
      walker.x,
      walker.y
    );
  //this allows gradual bleeding of colors onto each other
}

//Animaition Loop
function render(time) {
  const elapsed = 
    Math.min(34, time - previousTime);
  
  const frameScale = 
    elapsed / (1000 / 60);
  //screen render 60 fps; one frame is approx 1000 / 60 = 16.67 millisecond

  //Update Walkers
  for (const walker of walkers) {
    if (!walker.landed) {
      updateWalker(walker, frameScale);
    }
  }
  //Update Blooms
  for (const bloom of blooms) {
    paintBloom(bloom, frameScale);
  }
  //Update Connections
  for (const connection of connections) {
    paintConnection(connection, frameScale);
  }

  //Combine the canvas layers
  context.globalCompositeOperation = "multiply";
  //multiply blending ameks overlapping colors to darket (like in photoshop)
  context.filter = "blur(6px) saturate(112%)";
  context.drawImage(bleedCanvas, 0, 0, width, height);
  context.filter = "none";
  context.drawImage(pigmentCanvas, 0, 0, width, height);
  //JavaScript requests ANOTHER frame:
  requestAnimationFrame(render);
}

//Clearing the artwork
function clearArtwork() {
  walkers.length = 0;
  blooms.length = 0;
  connections.length = 0;
  nodeCount = 0;

  pigmentContext.clearRect(0, 0, width, height);
  bleedContext.clearRect(0, 0, width, height);
  //origial interface restored
}

canvas.addEventListener("pointerdown", (event) => {
  const bounds = canvas.getBoundingClientRect();

  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;

  startAt(x, y);
});

clearButton.addEventListener(
  "click",
  clearArtwork
);

window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();
requestAnimationFrame(render);
