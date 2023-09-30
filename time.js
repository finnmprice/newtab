setTime();
const timeID = setInterval(setTime, 1000);

function setTime() {
  var currentTime = new Date();
    var time = currentTime.getHours() + ":" + currentTime.getMinutes();

    time = time.split(':'); // convert to array

    var hours = Number(time[0]);
    var minutes = Number(time[1]);

    var timeValue;

    if (hours > 0 && hours <= 12) {
      timeValue= "" + hours;
    } else if (hours > 12) {
      timeValue= "" + (hours - 12);
    } else if (hours == 0) {
      timeValue= "12";
    }

    timeValue += (minutes < 10) ? ":0" + minutes : ":" + minutes;  // get minutes
    document.getElementById("time").innerHTML = timeValue;
}