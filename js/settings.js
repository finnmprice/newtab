//storage
chrome.storage.local.get(["rgb"]).then((result) => {
  rgb = result.rgb;
  if (rgb == undefined)
      rgb = [45,75,80];
  let [r,g,b] = rgb;
  UpdateValue("r", r);
  UpdateValue("g", g);
  UpdateValue("b", b);
  document.body.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
  hex.value = rgbToHex(r,g,b);
});

chrome.storage.local.get(["timeShow"]).then((result) => {
  timeShow = result.timeShow;
  if (timeShow == undefined)
    timeShow = true;
  if (timeShow) {
    $('#time').fadeIn(100);
    $('#timeToggle').prop("checked", true);
  }
  else {
    $('#time').hide();
    $('#timeToggle').prop("checked", false);
  }
});

chrome.storage.local.get(["timeFont"]).then((result) => {
  timeFont = result.timeFont
  if (result.timeFont == undefined)
    timeFont = 64;
  document.getElementById('time').style.fontSize = timeFont + "px";
  document.getElementById('tslider').value = timeFont;
  document.getElementById('tdisplay').innerHTML = timeFont + "px";
});

chrome.storage.local.get(["searchShow"]).then((result) => {
  searchShow = result.searchShow;
  if (searchShow == undefined)
    searchShow = true;
  if (searchShow) {
    $('.search').fadeIn(100);
    $('#searchToggle').prop("checked", true);
  }
  else {
    $('.search').hide();
    $('#searchToggle').prop("checked", false);
  }
});

chrome.storage.local.get(["searchY"]).then((result) => {
  searchY = result.searchY
  if (result.searchY == undefined)
    searchY = 50;
  $('.search').css('margin-top',searchY + "vh");
  document.getElementById('yslider').value = searchY;
  document.getElementById('ydisplay').innerHTML = searchY + "%";
});

chrome.storage.local.get(["engine"]).then((result) => {
  engine = result.engine
  if (result.engine == undefined)
    searchY = "duck";
  $('.search').css('margin-top',searchY + "vh");
  document.getElementById('yslider').value = searchY;
  document.getElementById('ydisplay').innerHTML = searchY + "%";
});

//sliders

rslider = document.getElementById('rslider');
gslider = document.getElementById('gslider');
bslider = document.getElementById('bslider');
tslider = document.getElementById('tslider');
yslider = document.getElementById('yslider');

$('#rslider').on('input', function() {
    UpdateValue("r", this.value);
    document.body.style.backgroundColor = "rgb(" + this.value + "," + gslider.value + "," + bslider.value + ")";
});

$('#gslider').on('input',function() {
    UpdateValue("g", this.value);
    document.body.style.backgroundColor = "rgb(" + rslider.value + "," + this.value + "," + bslider.value + ")";
});

$('#bslider').on('input', function() {
    UpdateValue("b", this.value);
    document.body.style.backgroundColor = "rgb(" + rslider.value + "," + gslider.value + "," + this.value + ")";
});

$('#tslider').on('input', function() {
  document.getElementById('time').style.fontSize = this.value + "px";
  document.getElementById('tdisplay').innerHTML = this.value + "px";
  chrome.storage.local.set({ timeFont: this.value });
});

$('#yslider').on('input', function() {
  console.log(this.value);
  $('.search').css('margin-top',this.value + "vh");
  document.getElementById('ydisplay').innerHTML = this.value + "%";
  chrome.storage.local.set({ searchY: this.value });
});

hex = document.getElementById('hex');

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
    chrome.storage.local.set({ rgb: [rslider.value, gslider.value, bslider.value] });
}

//settings

$(".settingsButton").click(function(){
  $(".settings").fadeToggle(75);
});

$("#settingsExit").click(function(){
  $(".settings").fadeOut(75);
});

//randomize color

$(".randomButton").click(function(){
    number = randomInt(50,150);
    UpdateValue("r", number + (randomInt(0,50) * (Math.round(Math.random()) * 2 - 1)));
    UpdateValue("g", number + (randomInt(0,50) * (Math.round(Math.random()) * 2 - 1)));
    UpdateValue("b", number + (randomInt(0,50) * (Math.round(Math.random()) * 2 - 1)));
    document.body.style.backgroundColor = "rgb(" + rslider.value + "," + gslider.value + "," + bslider.value + ")";

});


function randomInt(min, max) { 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

//hex

function rgbToHex(r, g, b) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function hexToRgb(hex) {
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

//toggle time

$('#timeToggle').change(function() {
  if(!this.checked) {
    $('#time').fadeOut(100);
    chrome.storage.local.set({ timeShow: false });
  }
  else {
    $('#time').fadeIn(100);
    chrome.storage.local.set({ timeShow: true });
  }
});

//search

$('#searchToggle').change(function() {
  if(!this.checked) {
    $('.search').fadeOut(100);
    chrome.storage.local.set({ searchShow: false });
  }
  else {
    $('.search').fadeIn(100);
    chrome.storage.local.set({ searchShow: true });
  }
});

$('#searchInput').on('keypress', function (e) {
  val = $('#searchInput').val();

  if((e.which === 13) && (val.replace(/\s/g, "").length > 0)) {

    if(validURL(val)) {
      if(val.toLowerCase().includes("http")) {
        window.location.href = val;
      }
      else {
        window.location.href = "https://" + val;
      }
    }
    else if(val == "ppsbathrooms" || val == "pps bathrooms") {
      window.location.href = "https://ppsbathrooms.org";
    }
    else {
      window.location.href = ("https://duckduckgo.com/?q=" + $('#searchInput').val());
    }
  }
});

$('#searchInput').on('input', function() {
    val = $('#searchInput').val();
    if(val != "") {
      $('#clearSearch').show();
    }
    else {
      $('#clearSearch').hide();
    }
});

$("#clearSearch").click(function() {
    $('#searchInput').val("");
    $('#clearSearch').hide();
    $('#searchInput').focus();
});

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

$('#engines').on('input', function() {
  console.log(this.value);
  chrome.storage.local.set({ engine: this.value });
});

//time

setTime();
const timeID = setInterval(setTime, 1000);

function setTime() {
  var currentTime = new Date();
    var time = currentTime.getHours() + ":" + currentTime.getMinutes();

    time = time.split(':');

    var hours = Number(time[0]);
    var minutes = Number(time[1]);

    var timeValue;

    if (hours > 0 && hours <= 12) {
      timeValue = "" + hours;
    } else if (hours > 12) {
      timeValue = "" + (hours - 12);
    } else if (hours == 0) {
      timeValue = "12";
    }

    timeValue += (minutes < 10) ? ":0" + minutes : ":" + minutes;
    if(document.getElementById("time").innerHTML !== timeValue)
      document.getElementById("time").innerHTML = timeValue;
}