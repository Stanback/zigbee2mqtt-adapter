/**
 * zigbee2mqtt-adapter.js - Adapter to use all those zigbee devices via
 * zigbee2mqtt.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

'use strict';

const mqtt = require('mqtt');
const { Adapter, Device, Property, Event } = require('gateway-addon');

const Devices = require('./devices');

const identity = v => v;

class MqttProperty extends Property {
  constructor(device, name, propertyDescription) {
    super(device, name, propertyDescription);
    this.setCachedValue(propertyDescription.value);
    this.device.notifyPropertyChanged(this);
    this.options = propertyDescription;
  }

  setValue(value) {
    return new Promise((resolve, reject) => {
      super
        .setValue(value)
        .then(updatedValue => {
          const { toMqtt = identity } = this.options;
          this.device.adapter.publishMessage(`${this.device.id}/set`, {
            [this.name]: toMqtt(updatedValue),
          });
          resolve(updatedValue);
          this.device.notifyPropertyChanged(this);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}

class MqttDevice extends Device {
  constructor(adapter, id, description, info) {
    super(adapter, id);
    this.name = description.name;
    this['@type'] = description['@type'];
    for (const [name, desc] of Object.entries(description.properties || {})) {
      const property = new MqttProperty(this, name, desc);
      this.properties.set(name, property);
    }
    for (const [name, desc] of Object.entries(description.events || {})) {
      this.addEvent(name, desc);
    }
    this.updateProperties(description, info);
  }

  updateProperties(description, info) {
    for (const key of Object.keys(info)) {
      const property = this.findProperty(key);
      if (!property) {
        continue;
      }
      const { fromMqtt = identity } = description.properties[key];
      property.setCachedValue(fromMqtt(msg[key], msg));
      this.notifyPropertyChanged(property);
    }
  }
}

class ZigbeeMqttAdapter extends Adapter {
  constructor(addonManager, manifest) {
    super(addonManager, 'ZigbeeMqttAdapter', manifest.name);
    this.config = manifest.moziot.config;
    addonManager.addAdapter(this);

    this.client = mqtt.connect(this.config.mqtt);
    this.client.on('error', error => console.error('mqtt error', error));
    this.client.on('message', this.handleIncomingMessage.bind(this));
    this.client.subscribe(`${this.config.prefix}/bridge/config/devices`);
    this.client.subscribe(`${this.config.prefix}/+`);
    this.client.publish(`${this.config.prefix}/bridge/config/devices/get`);
  }

  handleIncomingMessage(topic, data) {
    const msg = JSON.parse(data.toString());
    if (topic.startsWith(`${this.config.prefix}/bridge/config/devices`)) {
      for (const device of msg) {
        this.addDevice(device);
      }
    }
    if (!topic.startsWith(`${this.config.prefix}/bridge`)) {
      // Not receiving modelId in msg payload, get friendlyName from topic
      const friendlyName = topic.replace(`${this.config.prefix}/`, '');
      // const description = Devices[msg.device.modelId];
      const description = Devices[friendlyName];
      const device = this.devices[friendlyName];
      if (!device) {
        return;
      }
      if (msg.action && description.events[msg.action]) {
        const event = new Event(
          device,
          msg.action,
          msg[description.events[msg.action]],
        );
        device.eventNotify(event);
      }
      device.updateProperties(description, msg);
    }
  }

  publishMessage(topic, msg) {
    this.client.publish(`${this.config.prefix}/${topic}`, JSON.stringify(msg));
  }

  addDevice(info) {
    // const description = Devices[info.modelId];
    const description = Devices[info.friendly_name];
    if (!description) {
      return;
    }
    const device = new MqttDevice(this, info.friendly_name, description, info);
    this.handleDeviceAdded(device);
  }

  startPairing(_timeoutSeconds) {
    this.client.publish(`${this.config.prefix}/bridge/config/devices/get`);
    // TODO: Set permitJoin
  }

  cancelPairing() {
    // TODO: Clear permitJoin
  }
}

function loadAdapter(addonManager, manifest, _errorCallback) {
  new ZigbeeMqttAdapter(addonManager, manifest);
}

module.exports = loadAdapter;
