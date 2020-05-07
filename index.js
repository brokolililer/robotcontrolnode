

//Express
var fs = require('fs');
const os = require('os');
const path = require('path');
const app = require('express')();

//SocketIO
const server = require('http').Server(app);
const io = require('socket.io')(server);

var SerialPort = require("serialport");
var five = require("johnny-five");
var usbDetect = require('usb-detection');
usbDetect.startMonitoring();
server.listen(3000);
//var dataPort = ['COM1', 'COM3', 'COM4', 'COM8'];
var dataPort = [];
var loop_data = null;
var obj;
var board;

var parsing = null;
var statusBoard = true;
var statusCom = [];
io.on('connection', (socket) => {
  //board.isReady=false;
  console.log('User Socket Connected');
  if (statusCom.length > 0) {
    socket.emit('arduino_service_result', 'Ok');
  }
  console.log("durum: " + statusBoard);
  console.log("statusCom: " + statusCom);
  socket.on("disconnect", () => console.log(`${socket.id} User disconnected.`));
  socket.emit('arduino_service', dataPort);
  socket.emit('arduino_service', dataPort);
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  //--------------------
  // var portArray = [];
  function listPorts() {
    dataPort = [];
    SerialPort.list().then(
      ports => {
        ports.forEach(port => {
          dataPort.push(port.path + "");
          //  console.log("burak");
          //    console.log(port.path);
        })
      },
      err => {
        console.error('Error listing ports', err)
      }
    )
  }
  async function listOfPort() {
    listPorts();
    await sleep(100);
    console.log(dataPort);
  }
  listOfPort();

  //-----------------





  socket.broadcast.on('arduino_service_download_command_list', download_command_list => {
    console.log("gelen: " + download_command_list);
    const desktopDir = path.join(os.homedir(), "Desktop");
    console.log(desktopDir);
    fs.writeFile(desktopDir + '\\command_list.txt', download_command_list, function (err, data) {
      if (err) throw err;
      console.log('download_command_list yazıldı.');
    });
  });
  socket.broadcast.on('arduino_service_download_loop_list', download_loop_list => {
    console.log("gelen: " + download_loop_list);
    const desktopDir = path.join(os.homedir(), "Desktop");
    console.log(desktopDir);
    fs.writeFile(desktopDir + '\\loop_list.txt', download_loop_list, function (err, data) {
      if (err) throw err;
      console.log('download_loop_list yazıldı.');
    });
  });
  var closing;
  socket.broadcast.on("arduino_service_port_close", data_close => {

    closing = data_close;

  });
  socket.broadcast.on("arduino_service_port", data => {
    obj = JSON.parse(data);
    console.log(obj.arduino_serial.comport);
    if (statusBoard == false) {

      socket.emit('arduino_service_port_status_board', 'NotFound');
    }
    else if (obj.arduino_serial.status == 'false' && statusCom.length == 0) {
      board = new five.Board({   repl: false,
        debug: false,port: obj.arduino_serial.comport.toString() });
      statusCom.push(obj.arduino_serial.comport.toString());
      statusBoard = false;
    }
    //SerialPort(obj.arduino_serial.comport.toString(), {})

    //board.port=obj.arduino_serial.comport.toString(
    if (statusCom.length > 0) {
      console.log(statusCom.length+"if icinde");
      socket.emit('arduino_service_result', 'Ok');
      console.log(statusCom.length+"board.isReady mi222 "+board.isReady);
      if (board.isReady == true) {
        console.log("Sinan kankammmmm");
        socket.broadcast.on("arduino_center", data_arduino_center => {
          loop_center = data_arduino_center;
          console.log("Arduino Center Data : " + loop_center);
          parsing = loop_center.toString().split(",");

          var servo = [];
          async function servoCenter() {
            for (let index = 0; index < parsing.length; index++) {
              console.log("pin: " + parsing[index].split("-")[2].toString().substr(1));
              console.log("servo centering...");
              servo[index] = new five.Servo(parsing[index].split("-")[2].toString().substr(1));

              servo[index].center();
              await sleep(500);
            }
          }
          servo = [];
          // --------------
          servoCenter();
          socket.emit('arduino_service_center_status', 'Ok');
          socket.emit('arduino_service_center_status', 'Ok');
        });
        socket.broadcast.on("arduino_loop", data_arduino_loop => {
          loop_data = data_arduino_loop;
          console.log("Arduino Loop Data : " + loop_data);
          parsing = loop_data.toString().split(",");

          var servo2 = [];
          var i = 0;
          async function delayedGreeting() {

            while (i < parseInt(parsing[parsing.length - 1])) {
              socket.emit('arduino_service_loop_step', (i + 1).toString());
              for (let index = 0; index < parsing.length - 1; index++) {
                console.log("pin: " + parsing[index].split("-")[2].toString().substr(1) + " degree: " + parseInt(parsing[index].split("-")[3])
                  + " delay: " + parseInt(parsing[index].split("-")[1]));
                switch (parsing[index].split("-")[0].toString()) {
                  case 'Left':
                    servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [0, 90] });
                    servo2[index].to(parseInt(parsing[index].split("-")[3]));
                    await sleep(parseInt(parsing[index].split("-")[1]));
                    break;
                  case 'Right':
                    servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [90, 180] });
                    servo2[index].to(parseInt(parsing[index].split("-")[3]));
                    await sleep(parseInt(parsing[index].split("-")[1]));
                    break;
                  case 'Up':
                    servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [0, 90] });
                    servo2[index].to(parseInt(parsing[index].split("-")[3]));
                    await sleep(parseInt(parsing[index].split("-")[1]));
                    break;
                  case 'Down':
                    servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [90, 180] });
                    servo2[index].to(parseInt(parsing[index].split("-")[3]));
                    await sleep(parseInt(parsing[index].split("-")[1]));
                    break;
                  case 'Forward':
                    servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [0, 90] });
                    servo2[index].to(parseInt(parsing[index].split("-")[3]));
                    await sleep(parseInt(parsing[index].split("-")[1]));
                    break;
                  case 'Back':
                    servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [90, 180] });
                    servo2[index].to(parseInt(parsing[index].split("-")[3]));
                    await sleep(parseInt(parsing[index].split("-")[1]));
                    break;
                  case 'Open':
                    servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [0, 90] });
                    servo2[index].to(parseInt(parsing[index].split("-")[3]));
                    await sleep(parseInt(parsing[index].split("-")[1]));
                    break;
                  case 'Close':
                    servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [90, 180] });
                    servo2[index].to(parseInt(parsing[index].split("-")[3]));
                    await sleep(parseInt(parsing[index].split("-")[1]));
                    break;
                  default:
                    break;
                }


              }
              i++
            }
          }


          delayedGreeting();



        });
      }
      board.on("ready", function () {

        console.log(statusCom.length+"ready icinde");
        console.log(statusCom.length+"board.isReady mi "+board.isReady);
        if (board.isReady == true) {
          console.log(statusCom.length+"readytrue icinde");
          statusBoard = true;
          console.log("board: " + board.isReady);
          socket.emit('arduino_service_result', 'Ok');

          socket.broadcast.on("arduino_center", data_arduino_center => {
            loop_center = data_arduino_center;
            console.log("Arduino Center Data : " + loop_center);
            parsing = loop_center.toString().split(",");

            var servo = [];
            async function servoCenter() {
              for (let index = 0; index < parsing.length; index++) {
                console.log("pin: " + parsing[index].split("-")[2].toString().substr(1));
                console.log("servo centering...");
                servo[index] = new five.Servo(parsing[index].split("-")[2].toString().substr(1));

                servo[index].center();
                await sleep(500);
              }
            }
            servo = [];
            // --------------
            servoCenter();
            socket.emit('arduino_service_center_status', 'Ok');
            socket.emit('arduino_service_center_status', 'Ok');
          });
          socket.broadcast.on("arduino_loop", data_arduino_loop => {
            loop_data = data_arduino_loop;
            console.log("Arduino Loop Data : " + loop_data);
            parsing = loop_data.toString().split(",");

            var servo2 = [];
            var i = 0;
            async function delayedGreeting() {

              while (i < parseInt(parsing[parsing.length - 1])) {
                socket.emit('arduino_service_loop_step', (i + 1).toString());
                for (let index = 0; index < parsing.length - 1; index++) {
                  console.log("pin: " + parsing[index].split("-")[2].toString().substr(1) + " degree: " + parseInt(parsing[index].split("-")[3])
                    + " delay: " + parseInt(parsing[index].split("-")[1]));
                  switch (parsing[index].split("-")[0].toString()) {
                    case 'Left':
                      servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [0, 90] });
                      servo2[index].to(parseInt(parsing[index].split("-")[3]));
                      await sleep(parseInt(parsing[index].split("-")[1]));
                      break;
                    case 'Right':
                      servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [90, 180] });
                      servo2[index].to(parseInt(parsing[index].split("-")[3]));
                      await sleep(parseInt(parsing[index].split("-")[1]));
                      break;
                    case 'Up':
                      servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [0, 90] });
                      servo2[index].to(parseInt(parsing[index].split("-")[3]));
                      await sleep(parseInt(parsing[index].split("-")[1]));
                      break;
                    case 'Down':
                      servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [90, 180] });
                      servo2[index].to(parseInt(parsing[index].split("-")[3]));
                      await sleep(parseInt(parsing[index].split("-")[1]));
                      break;
                    case 'Forward':
                      servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [0, 90] });
                      servo2[index].to(parseInt(parsing[index].split("-")[3]));
                      await sleep(parseInt(parsing[index].split("-")[1]));
                      break;
                    case 'Back':
                      servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [90, 180] });
                      servo2[index].to(parseInt(parsing[index].split("-")[3]));
                      await sleep(parseInt(parsing[index].split("-")[1]));
                      break;
                    case 'Open':
                      servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [0, 90] });
                      servo2[index].to(parseInt(parsing[index].split("-")[3]));
                      await sleep(parseInt(parsing[index].split("-")[1]));
                      break;
                    case 'Close':
                      servo2[index] = new five.Servo({ pin: parsing[index].split("-")[2].toString().substr(1), range: [90, 180] });
                      servo2[index].to(parseInt(parsing[index].split("-")[3]));
                      await sleep(parseInt(parsing[index].split("-")[1]));
                      break;
                    default:
                      break;
                  }


                }
                i++
              }
            }


            delayedGreeting();



          });

        }


      });


    }


  });
});

      // async function servoStart() {
      //   servoCenter();
      //   await sleep(1000);
      //   delayedGreeting();
      // }
      //servoCenter();
      // servoStart();