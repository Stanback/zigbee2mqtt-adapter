const ColorConverter = require('cie-rgb-color-converter');
const rgb2hex = require('pure-color/convert/rgb2hex');
const hex = require('pure-color/parse/hex');

const fromColor = (v, msg) => {
  const { r, g, b } = ColorConverter.xyBriToRgb(v.x, v.y, msg.brightness);
  return rgb2hex([r, g, b]);
};

const toColor = v => {
  const [ r, g, b ] = hex(v);
  const { x, y } = ColorConverter.rgbToXy(r, g, b);
  return { x, y };
};

module.exports = {
  'hue1': {
    name: 'Philips Hue Iris',
    '@type': ['Light', 'OnOffSwitch'],
    properties: {
      state: {
        '@type': 'OnOffProperty',
        type: 'boolean',
        fromMqtt: v => v === 'ON',
        toMqtt: v => (v ? 'ON' : 'OFF'),
      },
      brightness: {
        '@type': 'BrightnessProperty',
        type: 'number',
        minimum: 0,
        maximum: 100,
        fromMqtt: v => (v / 255) * 100,
        toMqtt: v => (v / 100) * 255,
      },
      color: {
        '@type': 'ColorProperty',
        type: 'string',
        fromMqtt: fromColor,
        toMqtt: toColor,
      },
      linkquality: {
        type: 'integer',
        readOnly: true,
      },
    },
  },
  'hue2': {
    name: 'Philips Hue white and color ambiance E26/E27/E14',
    '@type': ['Light', 'OnOffSwitch'],
    properties: {
      state: {
        '@type': 'OnOffProperty',
        type: 'boolean',
        fromMqtt: v => v === 'ON',
        toMqtt: v => (v ? 'ON' : 'OFF'),
      },
      brightness: {
        '@type': 'BrightnessProperty',
        type: 'number',
        minimum: 0,
        maximum: 100,
        fromMqtt: v => (v / 255) * 100,
        toMqtt: v => (v / 100) * 255,
      },
      color: {
        '@type': 'ColorProperty',
        type: 'string',
        fromMqtt: fromColor,
        toMqtt: toColor,
      },
      linkquality: {
        type: 'integer',
        readOnly: true,
      },
    },
  },
  'hue3': {
    name: 'Philips Hue white A60 bulb E27',
    '@type': ['Light', 'OnOffSwitch'],
    properties: {
      state: {
        '@type': 'OnOffProperty',
        type: 'boolean',
        fromMqtt: v => v === 'ON',
        toMqtt: v => (v ? 'ON' : 'OFF'),
      },
      brightness: {
        '@type': 'BrightnessProperty',
        type: 'number',
        minimum: 0,
        maximum: 100,
        fromMqtt: v => (v / 255) * 100,
        toMqtt: v => (v / 100) * 255,
      },
      linkquality: {
        type: 'integer',
        readOnly: true,
      },
    },
  },
  'hue4': {
    name: 'Philips Hue white and color ambiance E26/E27/E14',
    '@type': ['Light', 'OnOffSwitch'],
    properties: {
      state: {
        '@type': 'OnOffProperty',
        type: 'boolean',
        fromMqtt: v => v === 'ON',
        toMqtt: v => (v ? 'ON' : 'OFF'),
      },
      brightness: {
        '@type': 'BrightnessProperty',
        type: 'number',
        minimum: 0,
        maximum: 100,
        fromMqtt: v => (v / 255) * 100,
        toMqtt: v => (v / 100) * 255,
      },
      color: {
        '@type': 'ColorProperty',
        type: 'string',
        fromMqtt: fromColor,
        toMqtt: toColor,
      },
      linkquality: {
        type: 'integer',
        readOnly: true,
      },
    },
  },
  'hue5': {
    name: 'Philips Hue dimmer switch',
    '@type': ['OnOffSwitch', 'PushButton', 'MultiLevelSwitch'],
    properties: {
      state: {
        '@type': 'OnOffProperty',
        type: 'boolean',
        fromMqtt: v => v === 'ON',
        toMqtt: v => (v ? 'ON' : 'OFF'),
      },
      brightness: {
        '@type': 'LevelProperty',
        type: 'number',
        minimum: 0,
        maximum: 100,
        fromMqtt: v => (v / 255) * 100,
        toMqtt: v => (v / 100) * 255,
      },
      battery: {
        type: 'integer',
        unit: 'percent',
        minimum: 0,
        maximum: 100,
        readOnly: true,
      },
      linkquality: {
        type: 'integer',
        readOnly: true,
      },
    },
    events: {
      tap: {
        '@type': 'PressedEvent',
        type: 'integer',
        mqttField: 'tap',
      },
      /* DoublePressedEvent, LongPressedEvent */
    },
  },
};
