require('colors');
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const readLineSync = require('readline-sync');
const fs = require('fs-extra');
const open = require('opn');

let { gameName, gamePrimaryColor, gameSecondaryColor } = argv;

if (gameName === undefined) {
  gameName = readLineSync.question('What is the name of the new reskin? ', {
    limit: input => input.trim().length > 0,
    limitMessage: 'The project has to have a name, try again'
  });
}

const confirmColorInput = (color, colorType = 'primary') => {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (hexColorRegex.test(color)) {
    return color;
  }
  return readLineSync.question(`Enter a Hex Code for the game ${colorType} color `, {
    limit: hexColorRegex,
    limitMessage: 'Enter a valid hex code, e.g. #efefef'
  });
};

gamePrimaryColor = confirmColorInput(gamePrimaryColor, 'primary');
gameSecondaryColor = confirmColorInput(gameSecondaryColor, 'secondary');

console.log(`Creating a new reskin '${gameName}' with skin color: Primary: '${gamePrimaryColor}' Secondary: '${gameSecondaryColor}'`);

const src = path.join(__dirname, 'template');
const destination = path.join(__dirname, 'releases', gameName);
const configurationFile = path.join(destination, 'game.json');
const projectToOpen = path.join('http://localhost:8080', 'releases', gameName, 'index.html');

fs.copy(src, destination)
  .then(() => {
    console.log(`Successfully created ${destination}`.green);
    return fs.readJson(configurationFile);
  })
  .then((config) => {
    const newConfig = config;
    newConfig.primaryColor = gamePrimaryColor;
    newConfig.secondaryColor = gameSecondaryColor;
    return fs.writeJson(configurationFile, newConfig);
  })
  .then(() => {
    console.log(`Updated configuration file ${configurationFile}`.green);
    openGameIfAgreed(projectToOpen);
    process.exit(0);
  })
  .catch(console.error);


const openGameIfAgreed = (fileToOpen) => {
  const isOpeningGame = readLineSync.keyInYN('Would you like to open the game? ');
  if (isOpeningGame) {
    open(fileToOpen);
  }
};
