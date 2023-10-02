chrome.storage.local.get(["rgb"]).then((result) => {
    rgb = result.rgb;
    if (rgb == undefined)
        rgb = [44,75,80];
    let [r,g,b] = rgb;
    UpdateValue("r", r);
    UpdateValue("g", g);
    UpdateValue("b", b);
    document.body.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
});

rslide = document.getElementById('rslider');
gslide = document.getElementById('gslider');
bslide = document.getElementById('bslider');

rslide.onchange = function() {
    UpdateValue("r", this.value)
    document.body.style.backgroundColor = "rgb(" + this.value + "," + gslide.value + "," + bslide.value + ")";
    chrome.storage.local.set({ rgb: [this.value, gslide.value, bslide.value] });
}

gslide.onchange = function() {
    UpdateValue("g", this.value)
    document.body.style.backgroundColor = "rgb(" + rslide.value + "," + this.value + "," + bslide.value + ")";
    chrome.storage.local.set({ rgb: [rslide.value, this.value, bslide.value] });
}

bslide.onchange = function() {
    UpdateValue("b", this.value)
    document.body.style.backgroundColor = "rgb(" + rslide.value + "," + gslide.value + "," + this.value + ")";
    chrome.storage.local.set({ rgb: [rslide.value, gslide.value, this.value] });
}

function UpdateValue(key, value) {
    document.getElementById(key + 'slider').value = value;
    document.getElementById(key + 'display').innerHTML = value;
}

$(".settingsButton").click(function(){
  $(".settings").fadeToggle(75);
});

$("#settingsExit").click(function(){
  $(".settings").fadeOut(75);
});