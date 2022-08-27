// Do a scan and display the results in a menu
function doScan() {
  E.showMenu(); // remove menu
  Terminal.println("Scanning...");
  NRF.findDevices(function(devs) {
    var menu = { "" : {title:"No Devices Found"} };
    // Add any device with a name beginning with 'BBC'
    devs.forEach(function(dev) {
      print(dev.name);
      if (dev.name && dev.name.substr(0,3)=="BBC") {
        found = true;
        menu[""].title = "-- Connect -- ";
        menu[dev.name] = function() {
          askForText(dev);
        };
      }
    });
    // Add a menu option to rescan
    menu["-> Scan Again"] = function() {
      doScan(); // scan
    };
    // Show the menu
    E.showMenu(menu);
  });
}

// Show a list of text to send to the micro:bit
function askForText(dev) {  
  var d = new Date();
  var da = d.toString().split(" ");
  var time = da[4].substr(0, 5).split(":");
  var hours = time[0],
    minutes = time[1];
  print(hours+minutes);
  E.showMenu({
    "":{title:"Which text?"},
    "Hello":function() { doConnect(dev,"Hello\n"); },
    "Goodbye":function() { doConnect(dev,"Goodbye\n"); },
    "Time":function() { doConnect(dev,hours+minutes+"\n"); },
    "-> Scan Again":function() { doScan(); },
  });
}

/* Connect and send, max 20 characters. The micro:bit's
UART isn't actually a standard Nordic UART so we can't
use built-in libraries and have to do this manually. */
function doConnect(dev, text) {
  E.showMenu(); // remove menu
  Terminal.println("Connecting...");
  var device;
  dev.gatt.connect().then(function(d) {
    Terminal.println("Connected! Finding service");
    device = d;
    return d.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(s) {
    Terminal.println("Finding characteristic");
    return s.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(c) {
    Terminal.println("Sending");
    return c.writeValue(text);
  }).then(function() {
    device.disconnect();
    Terminal.println('Done!');
    setTimeout(function() {
      doScan();
    }, 2000);
  }).catch(function(err) {
    print(err);    
    Terminal.println("Error!");
    setTimeout(function() {
      doScan();
    }, 2000);
    if (device) device.disconnect();
  });
}

// When initialised start scanning
function onInit() {
  doScan();
}

onInit();