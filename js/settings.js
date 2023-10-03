hex = document.getElementById('hex');

chrome.storage.local.get(["rgb"]).then((result) => {
    rgb = result.rgb;
    if (rgb == undefined)
        rgb = [44,75,80];
    let [r,g,b] = rgb;
    UpdateValue("r", r);
    UpdateValue("g", g);
    UpdateValue("b", b);
    document.body.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
    hex.value = rgbToHex(r,g,b);
});

rslider = document.getElementById('rslider');
gslider = document.getElementById('gslider');
bslider = document.getElementById('bslider');

$('#rslider').on('input', function() {
    UpdateValue("r", this.value);
    document.body.style.backgroundColor = "rgb(" + this.value + "," + gslider.value + "," + bslider.value + ")";
    chrome.storage.local.set({ rgb: [this.value, gslider.value, bslider.value] });
});

$('#gslider').on('input',function() {
    UpdateValue("g", this.value);
    document.body.style.backgroundColor = "rgb(" + rslider.value + "," + this.value + "," + bslider.value + ")";
    chrome.storage.local.set({ rgb: [rslider.value, this.value, bslider.value] });
});

$('#bslider').on('input', function() {
    UpdateValue("b", this.value);
    document.body.style.backgroundColor = "rgb(" + rslider.value + "," + gslider.value + "," + this.value + ")";
    chrome.storage.local.set({ rgb: [rslider.value, gslider.value, this.value] });
});

hex.onchange = function() {
    document.body.style.backgroundColor = hex.value;
    hexValue = hexToRgb(hex.value);
    if (hexValue !== null) {
        UpdateValue("r", hexValue.r)
        UpdateValue("g", hexValue.g)
        UpdateValue("b", hexValue.b)
    }
}

function UpdateValue(key, value) {
    document.getElementById(key + 'slider').value = value;
    document.getElementById(key + 'display').innerHTML = value;

    hex.value = rgbToHex(rslider.value, gslider.value, bslider.value);
}

$(".settingsButton").click(function(){
  $(".settings").fadeToggle(75);
});

$("#settingsExit").click(function(){
  $(".settings").fadeOut(75);
});


$(".randomButton").click(function(){
    number = randomInt(50,150);
    UpdateValue("r", number + (randomInt(0,50) * (Math.round(Math.random()) * 2 - 1)));
    UpdateValue("g", number + (randomInt(0,50) * (Math.round(Math.random()) * 2 - 1)));
    UpdateValue("b", number + (randomInt(0,50) * (Math.round(Math.random()) * 2 - 1)));
    document.body.style.backgroundColor = "rgb(" + rslider.value + "," + gslider.value + "," + bslider.value + ")";
    chrome.storage.local.set({ rgb: [rslider.value, gslider.value, bslider.value] });
});


function randomInt(min, max) { 
  return Math.floor(Math.random() * (max - min + 1) + min)
}


function rgbToHex(r, g, b) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}