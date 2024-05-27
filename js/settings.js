var hourMode = false;
var showSeconds = false;
var randomColor = false;
var randomColors;
var randomGradient;
var bgColor;
let urlMappings;
let ecosiaMode;
let ecosiaSearches;

var manifestVersion = chrome.runtime.getManifest()
$('#manifestVersion').text(`v${manifestVersion.version}`)

// add ecosia tree counter

const defaults = {
    "color": [24, 32, 54],
    "timeShow": true,
    "fontSize": 64,
    "showSearch": true,
    "searchY": 45,
    "engine": "duck",
    "buttonPosition": 3,
    "font": "forzan",
    "seconds": false,
    "military": false,
    "randomColor": false,
    "randomGradient": false,
    "ecosiaMode": false,
    "ecosiaSearches": 0
}


const pickr = Pickr.create({
    el: '#color-picker',
    theme: 'nano',
    default: `rgb(${defaults.color[0]}, ${defaults.color[1]}, ${defaults.color[2]})`,
    components: {
        preview: true,
        hue: true,
        interaction: {
            hex: true,
            rgba: true,
            input: true,
            save: false
        }
    }
});

async function loadUrlMappings() {
    try {
        const response = await fetch('/js/urls.json');
        urlMappings = await response.json();
    } catch (error) {
        console.error('Error loading URL mappings:', error);
    }
}
loadUrlMappings();

chrome.storage.local.get([
    "randomColor", "randomColors", "randomGradient", "rgb", "timeShow", "timeFont", "searchShow", "searchY", 
    "engine", "buttonPosition", "font", "showSeconds", "hourMode", "ecosiaMode", "ecosiaSearches"], (result) => {

    randomColors = result.randomColors ?? [];
    if (randomColors.length === 0) {
        $.get("style/colors.txt", function(data) {
            randomColors = data.trim().split("\n").map(color => color.trim());
            chrome.storage.local.set({randomColors: randomColors});
        });
    }

    const textArea = document.getElementById('colorsTextArea');
    if (textArea && randomColors.length > 0) {
        textArea.value = randomColors.join('\n');
    }

    randomGradient = result.randomGradient ?? defaults.randomGradient;
    $('#randomGradientToggle').prop("checked", randomGradient);
    if (randomGradient) {
        randomBgGradient();
    }

    ecosiaSearches = result.ecosiaSearches ?? defaults.ecosiaSearches;
    $('#treeNumber').html(getEcosiaTrees());
    updateEcosiaBar();
    
    randomColor = result.randomColor ?? defaults.randomColor;
    $('#randomToggle').prop("checked", randomColor);
    let [r, g, b] = result.rgb ?? defaults.color;
    bgColor = `rgb(${r},${g},${b})`;
    updateColorDisplay(r, g, b);

    ecosiaMode = result.ecosiaMode ?? defaults.ecosiaMode;
    setEcosiaMode(ecosiaMode);

    if (randomColor) {
        randomBgColor();
    }
    else {
        document.body.style.background = bgColor;
    }

    timeShow = result.timeShow ?? defaults.timeShow;
    $('#time').toggle(timeShow);
    $('#timeToggle').prop("checked", timeShow);

    setTimeSize(result.timeFont ?? defaults.fontSize);

    searchShow = result.searchShow ?? defaults.showSearch;
    $('.search').toggle(searchShow);
    $('#searchToggle').prop("checked", searchShow);
    searchY = result.searchY ?? defaults.searchY;
    $('.search').css('margin-top', searchY - 2 + "vh");
    document.getElementById('yslider').value = searchY;
    setSearchHeight(searchY);
    
    engine = result.engine ?? defaults.engine;
    $("#engines").val(engine);
    if (engine == 'ecosia') {
        $('#ecosiaMode').show(100);
    } else {
        setEcosiaMode(false);
        $('#ecosiaMode').hide(100);
    }
    updateDropdownWidth('engines');

    setButtonLocation(result.buttonPosition ?? defaults.buttonPosition);

    font = result.font ?? defaults.font;
    $('#time').css("font-family", font);
    $("#fonts").val(font);
    updateDropdownWidth('fonts');

    showSeconds = result.showSeconds ?? defaults.seconds;
    $('#showSeconds').prop("checked", showSeconds);
    hourMode = result.hourMode ?? defaults.military;
    $('#timeMode').prop("checked", hourMode);
    setTime();
});

function randomBgColor() {
    const validHexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
    const validColors = randomColors.filter(color => color.trim() !== '' && validHexColorRegex.test(color.trim()));
    let colorToUse;
    let currentBgColor = document.body.style.backgroundColor;
    let attempts = 0;
    do {
        if (validColors.length > 0) {
            colorToUse = validColors[Math.floor(Math.random() * validColors.length)];
        } else {
            colorToUse = `rgb(${defaults.color[0]}, ${defaults.color[1]}, ${defaults.color[2]})`;
        }
        const {r, g, b} = hexToRgb(colorToUse);
        if (`rgb(${r},${g},${b})` !== currentBgColor || attempts >= validColors.length) {
            updateColorDisplay(r, g, b);
            document.body.style.background = `rgb(${r},${g},${b})`;
            break;
        }
        attempts++;
    } while (true);
}

function randomBgGradient() {
    document.body.style.transition = 'background 5s linear';
    var color1;
    var color2;

    if(bgColor && !randomColor) {
        let rgbValues = bgColor.match(/\d+/g);
        let currentBg = rgbToHex(parseInt(rgbValues[0]), parseInt(rgbValues[1]), parseInt(rgbValues[2]));
        color1 = currentBg;
        color2 = currentBg;
    }
    else if (bgColor && randomColor) {
        let rgbValues = document.body.style.backgroundColor.match(/\d+/g);
        let currentBg = rgbToHex(parseInt(rgbValues[0]), parseInt(rgbValues[1]), parseInt(rgbValues[2]));
        color1 = currentBg;
        color2 = currentBg;
    }
    else {
        color1 = randomColors[Math.floor(Math.random() * randomColors.length)];
        color2 = randomColors[Math.floor(Math.random() * randomColors.length)];
    }
    document.body.style.background = `linear-gradient(to right, ${color1}, ${color2})`;

    let interval;
    function updateGradient() {
        let newColor1 = randomColors[Math.floor(Math.random() * randomColors.length)];
        let newColor2 = randomColors[Math.floor(Math.random() * randomColors.length)];

        let step = 0;
        const steps = 500;
        interval = setInterval(() => {
            step++;
            let midColor1 = interpolateColor(color1, newColor1, step / steps);
            let midColor2 = interpolateColor(color2, newColor2, step / steps);
            document.body.style.background = `linear-gradient(to right, ${midColor1}, ${midColor2})`;
            if (step >= steps) {
                clearInterval(interval);
                color1 = newColor1;
                color2 = newColor2;
                updateGradient();
            }
        }, 0);
    }

    updateGradient();

    function stopGradientFade() {
        clearInterval(interval);
        document.body.style.transition = 'none';

        if ($('#randomToggle').prop('checked')) {
            randomBgColor();
        } else {
            document.body.style.background = bgColor;
        }
    }

    window.stopGradientFade = stopGradientFade;
}

function interpolateColor(colorStart, colorEnd, factor) {
    let result = colorStart.slice(1);
    let resultEnd = colorEnd.slice(1);

    let r = Math.ceil(parseInt(result.substring(0, 2), 16) * (1 - factor) + parseInt(resultEnd.substring(0, 2), 16) * factor);
    let g = Math.ceil(parseInt(result.substring(2, 4), 16) * (1 - factor) + parseInt(resultEnd.substring(2, 4), 16) * factor);
    let b = Math.ceil(parseInt(result.substring(4, 6), 16) * (1 - factor) + parseInt(resultEnd.substring(4, 6), 16) * factor);

    let hexR = r.toString(16).padStart(2, '0');
    let hexG = g.toString(16).padStart(2, '0');
    let hexB = b.toString(16).padStart(2, '0');

    return `#${hexR}${hexG}${hexB}`;
}

function updateColorDisplay(r, g, b) {
    rslider.value = r;
    gslider.value = g;
    bslider.value = b;

    document.getElementById('rdisplay').textContent = r;
    document.getElementById('gdisplay').textContent = g;
    document.getElementById('bdisplay').textContent = b;

    hex.value = rgbToHex(r, g, b);
}

rslider = document.getElementById('rslider');
gslider = document.getElementById('gslider');
bslider = document.getElementById('bslider');
tslider = document.getElementById('tslider');
yslider = document.getElementById('yslider');

$('#rslider, #gslider, #bslider').on('input', function() {
    if ($('#randomToggle').prop('checked')) {
        $('#randomToggle').click();
    }
    UpdateValue(rgbToHex($('#rslider').val(), $('#gslider').val(), $('#bslider').val()));
});

$('#tslider').on('input', function() {
    if (!$('#timeToggle').prop('checked')) {
        $('#timeToggle').click();
    }
    setTimeSize(this.value);
});

function setTimeSize(val) {
    document.getElementById('time').style.fontSize = val + "px";
    $('#tinput').val(val)
    updateTextWidth('tinput')
    $('#tslider').val(val)
    chrome.storage.local.set({timeFont: val});
}

function setSearchHeight(val) {
    $('.search').css('margin-top', val + "vh");
    $('#ecosiaLogo').css('margin-top', val + "vh");
    $('#yinput').val(val);
    chrome.storage.local.set({searchY: val});
    updateTextWidth('yinput')
}

$('#tinput').on('input', function() {
    let numericValue = Math.min(128, parseInt($(this).val().replace(/[^0-9]/g, '') || 0, 10));
    $(this).val(numericValue);
    updateTextWidth('tinput');
    setTimeSize(numericValue);
});

$('#yinput').on('input', function() {
    if (!$('#searchToggle').prop('checked')) {
        $('#searchToggle').click();
    }
    let numericValue = Math.min(95, parseInt($(this).val().replace(/[^0-9]/g, '') || 0, 10));
    $(this).val(numericValue);
    setSearchHeight(numericValue);
});

function updateTextWidth(id) {
    document.getElementById(id).style.width = document.getElementById(id).value.length + 1 + 'ch';
}

function updateDropdownWidth(id) {
    var selectedOption = $('#' + id + ' option:selected');
    $('#' + id).css('width', (selectedOption.text().length + 3) + 'ch');
}

$('#yslider').on('input', function() {
    if (!$('#searchToggle').prop('checked')) {
        $('#searchToggle').click();
    }
    setSearchHeight(this.value);
});

hex = document.getElementById('hex');

hex.oninput = function() {
    hexValue = hexToRgb(hex.value);
    if (hexValue !== null) {
        rslider.value = hexValue.r;
        gslider.value = hexValue.g;
        bslider.value = hexValue.b;
        UpdateValue(hex.value)
    }
}

function updateSliders(hexColor) {
    [
        ['r', 0],
        ['g', 1],
        ['b', 2]
    ].forEach(key => {
        const rgb = Math.round(hexColor[key[1]])
        document.getElementById(key[0] + 'slider').value = rgb;
        document.getElementById(key[0] + 'display').innerHTML = rgb;
    });
}

pickr.on('change', (color, instance) => {
    pickr.applyColor();
    updateSliders(color.toRGBA())
    chrome.storage.local.set({rgb: [rslider.value, gslider.value, bslider.value]});
    hex.value = rgbToHex(rslider.value, gslider.value, bslider.value);
    document.body.style.backgroundColor = `rgb(${color.toRGBA()[0]},${color.toRGBA()[1]},${color.toRGBA()[2]})`;
});

function UpdateValue(hex) {
        pickr.applyColor();
        pickr.setColor(hex);
        let rgb = hexToRgb(hex);
        bgColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

$("#settingsButton").click(function() {
    UpdateValue(hex.value);
    $(".settings").fadeToggle(100);
});

$("#settingsExit").click(function() {
    $(".settings").fadeOut(100);
    UpdateValue(hex.value);
});

$('#randomToggle').change(function() {

    if (!this.checked) {
        chrome.storage.local.set({randomColor: false});
        document.body.style.background = bgColor;
    } else {
        randomBgColor();
        chrome.storage.local.set({randomColor: true});
    }
});

$('#randomGradientToggle').change(function() {
    chrome.storage.local.set({randomGradient: this.checked});
    if (this.checked) {
        randomBgGradient();
    } else {
        stopGradientFade();
    }
});

$('#randomColorEdit').click(function() {
    $('.colorSettings').css('opacity', '1').show(0);
    $('.settingsInternalMain').css('opacity', '0').hide(0);
});

$('#colorEditExit').click(function() {
    let colors = $('#colorsTextArea').val().split('\n')
        .map(color => color.trim())
        .filter(color => /^[#]?[0-9A-F]{6}$/i.test(color))
        .map(color => color.startsWith('#') ? color : '#' + color);

    if (colors.length === 0) {
        fetch('style/colors.txt')
            .then(response => response.text())
            .then(text => {
                $('#colorsTextArea').val(text.trim());
                colors = text.split('\n').map(color => color.trim())
                    .map(color => color.startsWith('#') ? color : '#' + color);
                if ($('#randomToggle').prop('checked')) {
                    randomColors = colors;
                    randomBgColor();
                }
                chrome.storage.local.set({randomColors: colors});
            });
    } else {
        if ($('#randomToggle').prop('checked')) {
            randomColors = colors;
            randomBgColor();
        }
        chrome.storage.local.set({randomColors: colors});
    }

    $('.settingsInternalMain').css('opacity', '1').show(0);
    $('.colorSettings').css('opacity', '0').hide(0);
});

$('.timeContainer').click(e => {
    var isHidden = $(".settings").css("display") === "none";
    if (!isHidden) {
        $('.settings').fadeToggle(100);
    }
})

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

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

$('#timeToggle').change(function() {
    if (!this.checked) {
        $('#time').fadeOut(100);
        chrome.storage.local.set({timeShow: false});
    } else {
        $('#time').fadeIn(100);
        chrome.storage.local.set({timeShow: true});
    }
});

$('#fonts').on('input', function() {
    $('#time').css("font-family", $(this).val());
    chrome.storage.local.set({font: $(this).val()});
    updateDropdownWidth('fonts');
});

$('#searchToggle').change(function() {
    if (!this.checked) {
        $('.search').fadeOut(100);
        chrome.storage.local.set({searchShow: false});
    } else {
        $('.search').fadeIn(100);
        chrome.storage.local.set({searchShow: true});
    }
});

$('#searchInput').on('keypress', function(e) {
    if ((e.which === 13)) {
        search();
    }
});

$("#searchIcon").click(function() {
    search();
});

function getEcosiaTrees() {
    trees = Math.floor(ecosiaSearches / 50);
    return trees;
}

function updateEcosiaBar() {
    var searches = ecosiaSearches

    if (searches / 50 >= 1) {
        searches = searches - (Math.trunc(searches / 50) * 50);
    }
    px = searches / 50 * 100 / 50 * 25;

    $('#treeBar div').css('width', px)

}

// search bar functionality
function search() {
    const input = $('#searchInput').val().toLowerCase().trim();
    if (input.length === 0) {
        return;
    }
    if ($('#engines').val() == 'ecosia') {
        ecosiaSearches++;
        $('#treeNumber').html(getEcosiaTrees())
        updateEcosiaBar()
        chrome.storage.local.set({ecosiaSearches: ecosiaSearches});
    }
    if (validURL(val)) {
        if (val.toLowerCase().includes("http")) {
            window.location.href = val;
        } else {
            window.location.href = "https://" + val;
        }
        return;
    }

    function findMainKey(input) {
        for (const mainKey in urlMappings.alternatives) {
            const alternatives = urlMappings.alternatives[mainKey];
            for (const alternative of alternatives) {
                if (input.startsWith(alternative)) {
                    const restOfInput = input.slice(alternative.length).trim();
                    if (restOfInput === '') {
                        return mainKey
                    }
                    if (urlMappings.dynamic[mainKey]) {
                        const dynamicComponent = restOfInput ? ' ' + restOfInput : '';
                        return mainKey + dynamicComponent;
                    }
                    return mainKey + ' ' + restOfInput;
                }
            }
        }
        return input;
    }

    const mainKey = findMainKey(input);
    for (const key in urlMappings.dynamic) {
        if (mainKey.includes(key)) {
            const searchQuery = mainKey.replaceAll(key, '').trim();
            if (searchQuery == '') {
                continue
            }
            const dynamicUrl = urlMappings.dynamic[key] + searchQuery;
            window.location.href = dynamicUrl;
            return;
        }
    }

    if (urlMappings.static && urlMappings.static.hasOwnProperty(mainKey)) {
        window.location.href = urlMappings.static[mainKey];
        return;
    }

    window.location.href = getEngine() + encodeURIComponent(input);
}

$(document).on('keyup', function(evt) {
    if (evt.keyCode == 27) {
        $('#settingsButton').click();
    }
});

$('#searchInput').on('input', function() {
    val = $('#searchInput').val();
    if (val != "") {
        $('#clearSearch').show();
        $("#searchIcon").css('cursor', 'pointer');
    } else {
        $('#clearSearch').hide();
        $("#searchIcon").css('cursor', 'default');
    }
});

$("#clearSearch").click(function() {
    $('#searchInput').val("");
    $('#clearSearch').hide;
    $('#searchInput').focus();
});

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

$('#engines').on('input', function() {
    chrome.storage.local.set({ engine: this.value });
    if (this.value == 'ecosia') {
        $('#ecosiaMode').fadeIn(100);
    } else {
        $('#ecosiaMode').fadeOut(100);
        setEcosiaMode(false);
    }
    updateDropdownWidth('engines');
});

function setEcosiaMode(enable) {
    $('#ecosiaModeToggle').prop('checked', enable);
    ecosiaMode = enable;
    if (enable) {
        $('#ecosiaModeBg').fadeIn(0);
    } else {
        let rgbValues = bgColor.match(/\d+/g);
        UpdateValue(rgbToHex(parseInt(rgbValues[0]), parseInt(rgbValues[1]), parseInt(rgbValues[2])));
        $('#ecosiaModeBg').fadeOut(0);
        
    }
}

// fetch('https://ecosia.org').then((response) => response.text()).then((text) => console.log(text));


$('#ecosiaModeToggle').change(function() {
    setEcosiaMode(this.checked);
    chrome.storage.local.set({ecosiaMode: this.checked});
});

function getEngine() {
    const engines = {
        duck: "https://duckduckgo.com/?q=",
        ecosia: "https://www.ecosia.org/search?method=index&q=",
        google: "https://www.google.com/search?q=",
        brave: "https://search.brave.com/search?q=",
        bing: "https://www.bing.com/search?q=",
        yahoo: "https://search.yahoo.com/search?p="
    };
    return engines[$('#engines').val()] || '';
}

//time
setTime();
const timeID = setInterval(setTime, 100);

function setTime() {
    const currentTime = new Date();
    let hours = currentTime.getHours();
    let minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');

    if (!hourMode) {
        hours = hours % 12 || 12;
    }

    let timeValue = `${hours}:${minutes}`;
    if (showSeconds) {
        timeValue += `:${seconds}`;
    }

    const timeElement = document.getElementById("time");
    if (timeElement.innerHTML !== timeValue) {
        timeElement.innerHTML = timeValue;
    }
}

$('#timeMode').change(function() {
    hourMode = this.checked;
    chrome.storage.local.set({hourMode: this.checked});
    setTime();
});

$('#showSeconds').change(function() {
    showSeconds = this.checked;
    chrome.storage.local.set({showSeconds: this.checked});
    setTime();
});

//time buttons
$(".button1, .button2, .button3, .button4, .button5, .button6, .button7, .button8, .button9").click(function() {
    if (!$('#timeToggle').prop('checked')) {
        $('#timeToggle').click();
    }
    const position = $(this).attr("class").match(/\d+/)[0];
    setButtonLocation(position);
});

function setButtonLocation(buttonClass) {
    const buttonStyles = {
        1: {justifyContent: "left", alignItems: "start"},
        2: {justifyContent: "center", alignItems: "start"},
        3: {justifyContent: "right", alignItems: "start"},
        4: {justifyContent: "left", alignItems: "center"},
        5: {justifyContent: "center", alignItems: "center"},
        6: {justifyContent: "right", alignItems: "center"},
        7: {justifyContent: "left", alignItems: "flex-end"},
        8: {justifyContent: "center", alignItems: "flex-end"},
        9: {justifyContent: "right", alignItems: "flex-end"}
    };

    $(".timeContainer").css(buttonStyles[buttonClass]);

    const isButtonNine = buttonClass == 9;
    $(".settingsHover").css({
        left: isButtonNine ? "0" : "auto",
        right: isButtonNine ? "auto" : "0px",
        position: isButtonNine ? "" : "fixed"
    });
    $("#settingsButton").css({
        right: isButtonNine ? "auto" : "0px",
        left: isButtonNine ? "0px" : "auto"
    });

    for (let i = 1; i < 10; i++) {
        $('.button' + i).removeAttr('id');
    }

    $(".button" + buttonClass).prop('id', 'selectedButton');

    chrome.storage.local.set({buttonPosition: buttonClass});
}
