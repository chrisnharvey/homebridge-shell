var Service
var Characteristic

var util = require('util')
var exec = require('child_process').exec
var child

module.exports = function(homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-shell', 'Shell', shellAccessory)
}

function shellAccessory(log, config) {
  this.log = log
  this.service = 'Switch'
  this.name = config['name']

  this.powerState = false

  //retrieve fields from the config.json file
  this.onCommand = config['on']
  this.offCommand = config['off']
}

shellAccessory.prototype.getState = function (callback) {
  callback(null, this.powerState)
}

shellAccessory.prototype.setState = function(powerOn, callback) {
  var accessory = this
  var state = powerOn ? 'on' : 'off'

  this.powerState = powerOn

  var prop = state + 'Command'
  var command = accessory[prop].replace(/''/g, '"') // globally replace all occurrences of two seperate quotation marks with a double quotation mark

  child = exec(command, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout)
    console.log('stderr: ' + stderr)
    if (error !== null) {
      console.log('exec error: ' + error)
    } else {
      callback(null, true)
      accessory.log('Set ' + accessory.name + ' to ' + state)
    }
  })
}

shellAccessory.prototype.getServices = function() {
  var informationService = new Service.AccessoryInformation()
  var switchService = new Service.Lightbulb(this.name)

  informationService
    .setCharacteristic(Characteristic.Manufacturer, 'Chris Harvey')
    .setCharacteristic(Characteristic.Model, 'Shell script execution')
    .setCharacteristic(Characteristic.SerialNumber, '137')

  switchService
    .getCharacteristic(Characteristic.On)
    .on('set', this.setState.bind(this))
    .on('get', this.getState.bind(this))

  return [switchService]
}