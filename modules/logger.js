var color  = require('../modules/color'),
    events = require('../modules/events');

// Prints an output line with date and format
exports.print = function(label, content, colorcode){
  var time    = new Date().getTime(),
      longest = 12,
      fillup  = longest - label.length,
      output  = "";
      
  output += time;
  output += "    [" + color.green + label + color.reset + "]    ";
  for (var i=0; i < fillup; i++) { output += " " };
  output += colorcode + content + color.reset;
  
  console.log(output);
}

// Prints an output line with date and format
exports.printLine = function(label, content){
  var time    = new Date().getTime(),
      longest = 32,
      fillup  = longest - label.length,
      output  = "";
      
  output += time;
  output += "    [" + color.green + label + color.reset + "]";
  for (var i=0; i < fillup; i++) { output += " " };
  output += content;
  
  console.log(output);
}

// Round float numbers
exports.numberFormat = function(number){
  var rounded = Math.round(number * Math.pow(10,2)) / Math.pow(10,2);
  return rounded;
}