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

