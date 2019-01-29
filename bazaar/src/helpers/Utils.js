
export const ENTITY_COLORS = [
  "orange",
  "olive",
  "green",
  "teal",
  "red",
  "blue",
  "violet",
  "purple",
  "pink",
  "black"
];

export const DOC_ENTITY_COLORS = [
  "#E52B50",
  "#9966CC",
  "#007FFF",
  "#89CFF0",
  "#000000",
  "#0000FF",
  "#0095B6",
  "#8A2BE2",
  "#DE5D83",
  "#CD7F32",
  "#964B00",
  "#800020",
  "#702963",
  "#960018",
  "#DE3163",
  "#007BA7",
  "#7B3F00",
  "#0047AB",
  "#6F4E37",
  "#B87333",
  "#F88379",
  "#DC143C",
  "#50C878",
  "#00FF3F",
  "#FFD700",
  "#808080",
  "#00FF00",
  "#3FFF00",
  "#4B0082",
  "#00A86B",
  "#29AB87",
  "#B57EDC",
  "#C8A2C8",
  "#FF00FF",
  "#FF00AF",
  "#800000",
  "#000080",
  "#CC7722",
  "#808000",
  "#FFA500",
  "#FF4500",
  "#DA70D6",
  "#FFE5B4",
  "#D1E231",
  "#CCCCFF",
  "#1C39BB",
  "#FFC0CB",
  "#8E4585",
  "#003153",
  "#CC8899",
  "#800080",
  "#E30B5C",
  "#FF0000",
  "#C71585",
  "#FF007F",
  "#E0115F",
  "#FA8072",
  "#92000A",
  "#0F52BA",
  "#FF2400",
  "#C0C0C0",
  "#708090",
  "#A7FC00",
  "#00FF7F",
  "#D2B48C",
  "#483C32",
  "#008080",
  "#40E0D0",
  "#EE82EE",
  "#40826D",
  "#FFFFFF"
];

export const DUMMY_UID = "123";
export const DUMMY_TOKEN = "11111";
export const POS_TAGGING = "POS_TAGGING";
export const TEXT_SUMMARIZATION = "TEXT_SUMMARIZATION";
export const TEXT_CLASSIFICATION = "TEXT_CLASSIFICATION";
export const VIDEO_CLASSIFICATION = "VIDEO_CLASSIFICATION";
export const TEXT_MODERATION = "TEXT_MODERATION";
export const IMAGE_SEGMENTATION = "IMAGE_SEGMENTATION";
export const IMAGE_BOUNDING_BOX = "IMAGE_BOUNDING_BOX";
export const IMAGE_CLASSIFICATION = "IMAGE_CLASSIFICATION";
export const DOCUMENT_ANNOTATION = "DOCUMENT_ANNOTATION";
export const IMAGE_POLYGON_BOUNDING_BOX = "IMAGE_POLYGON_BOUNDING_BOX";
export const IMAGE_POLYGON_BOUNDING_BOX_V2 = "IMAGE_POLYGON_BOUNDING_BOX_V2";
export const IMAGE_BOUNDING_BOX_V2 = "IMAGE_POLYGON_BOUNDING_BOX_V2";
export const POS_TAGGING_GENERIC = "POS_TAGGING_GENERIC";
export const VIDEO_BOUNDING_BOX = "VIDEO_BOUNDING_BOX";

export const HIT_STATE_SKIPPED = "skipped";
export const HIT_STATE_DONE = "done";
export const HIT_STATE_NOT_DONE = "notDone";
export const HIT_STATE_DELETED = "deleted";
export const HIT_STATE_PRE_TAGGED = "preTagged";
export const HIT_STATE_REQUEUED = "reQueued";

export const HIT_EVALUATION_CORRECT = "correct";
export const HIT_EVALUATION_INCORRECT = "incorrect";


export const hitStateNameMap = {
  deleted: "Deleted",
  skipped: "Skipped",
  done: "Completed",
  reQueued: "Re-queued for Annotation",
  notDone: "Not Done",
  preTagged: "Pre Tagged"
};

export const nameTypeMap = {
  POS_TAGGING: "POS_TAGGING",
  TEXT_SUMMARIZATION: "TEXT_SUMMARIZATION",
  TEXT_CLASSIFICATION: "TEXT_CLASSIFICATION",
  TEXT_MODERATION: "TEXT_MODERATION",
  IMAGE_BOUNDING_BOX: "IMAGE_BOUNDING_BOX",
  IMAGE_CLASSIFICATION: "IMAGE_CLASSIFICATION",
  VIDEO_CLASSIFICATION: "VIDEO_CLASSIFICATION",
  DOCUMENT_ANNOTATION: "DOCUMENT_ANNOTATION",
  IMAGE_POLYGON_BOUNDING_BOX: "IMAGE_POLYGON_BOUNDING_BOX",
  IMAGE_POLYGON_BOUNDING_BOX_V2: "IMAGE_POLYGON_BOUNDING_BOX_V2",
  IMAGE_BOUNDING_BOX_V2: "IMAGE_POLYGON_BOUNDING_BOX_V2",
  POS_TAGGING_GENERIC: "POS_TAGGING_GENERIC",
  VIDEO_BOUNDING_BOX: "VIDEO_BOUNDING_BOX"
};
export const keyMap = {
  8: "backspace",
  9: "tab",
  13: "enter",
  20: "capslock",
  27: "esc",
  32: "space",
  33: "pageup",
  34: "pagedown",
  35: "end",
  36: "home",
  37: "left",
  38: "up",
  39: "right",
  40: "down",
  45: "ins",
  46: "del"
};

export const taskTypeMap = {
  VIDEO_CLASSIFICATION: "Video Classification",
  VIDEO_BOUNDING_BOX: "Video Annotation",
  POS_TAGGING_GENERIC: "NER Tagging",
  IMAGE_BOUNDING_BOX_V2: "Image Bounding Box",
  IMAGE_POLYGON_BOUNDING_BOX: "Image Polygon Bounding",
  IMAGE_POLYGON_BOUNDING_BOX_V2: "Image Segmentation",
  DOCUMENT_ANNOTATION: "Document Annotation",
  IMAGE_CLASSIFICATION: "Image Classification",
  IMAGE_BOUNDING_BOX: "Image OCR Bounding Boxes",
  IMAGE_SEGMENTATION: "Image Segmentation",
  POS_TAGGING: "Part of Speech Tagging: Small Sentences",
  TEXT_SUMMARIZATION: "Text Summarization",
  TEXT_CLASSIFICATION: "Text Classification",
  TEXT_MODERATION: "Text Moderation"
};

export const publicEmails = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "aol.com",
  "hotmail.co.uk",
  "hotmail.fr",
  "msn.com",
  "yahoo.fr",
  "wanadoo.fr",
  "orange.fr",
  "comcast.net",
  "yahoo.co.uk",
  "yahoo.com.br",
  "yahoo.co.in",
  "live.com",
  "rediffmail.com",
  "free.fr",
  "gmx.de",
  "web.de",
  "yandex.ru",
  "ymail.com",
  "libero.it",
  "outlook.com",
  "uol.com.br",
  "bol.com.br",
  "mail.ru",
  "cox.net",
  "hotmail.it",
  "sbcglobal.net",
  "sfr.fr",
  "live.fr",
  "verizon.net",
  "live.co.uk",
  "googlemail.com",
  "yahoo.es",
  "ig.com.br",
  "live.nl",
  "bigpond.com",
  "terra.com.br",
  "yahoo.it",
  "neuf.fr",
  "yahoo.de",
  "alice.it",
  "rocketmail.com",
  "att.net",
  "laposte.net",
  "facebook.com",
  "bellsouth.net",
  "yahoo.in",
  "hotmail.es",
  "charter.net",
  "yahoo.ca",
  "yahoo.com.au",
  "rambler.ru",
  "hotmail.de",
  "tiscali.it",
  "shaw.ca",
  "yahoo.co.jp",
  "sky.com",
  "earthlink.net",
  "optonline.net",
  "freenet.de",
  "t-online.de",
  "aliceadsl.fr",
  "virgilio.it",
  "home.nl",
  "qq.com",
  "telenet.be",
  "me.com",
  "yahoo.com.ar",
  "tiscali.co.uk",
  "yahoo.com.mx",
  "voila.fr",
  "gmx.net",
  "mail.com",
  "planet.nl",
  "tin.it",
  "live.it",
  "ntlworld.com",
  "arcor.de",
  "yahoo.co.id",
  "frontiernet.net",
  "hetnet.nl",
  "live.com.au",
  "yahoo.com.sg",
  "zonnet.nl",
  "club-internet.fr",
  "juno.com",
  "optusnet.com.au",
  "blueyonder.co.uk",
  "bluewin.ch",
  "skynet.be",
  "sympatico.ca",
  "windstream.net",
  "mac.com",
  "centurytel.net",
  "chello.nl",
  "live.ca",
  "aim.com",
  "bigpond.net.au"
];

export const createEntities = ruleLine => {
  const rules = JSON.parse(ruleLine);
  if (!rules.tags) {
    return [];
  }
  return rules.tags
    .split(",")
    .map(Function.prototype.call, String.prototype.trim);
};

export const createEntitiesJson = ruleLine => {
  const rules = JSON.parse(ruleLine);
  if (!rules.tags) {
    return [];
  }
  if (typeof rules.tags !== 'string') {
    const entities = [];
    const entityJson = {};
    for (let index = 0; index < rules.tags.length; index ++) {
      entities.push(rules.tags[index].label);
      entityJson[rules.tags[index].label] = rules.tags[index].imageUrl;
    }
    return { entities, entityJson };
  } else if (typeof rules.tags === 'string') {
    return { entities: rules.tags
      .split(",")
      .map(Function.prototype.call, String.prototype.trim), entityJson: {} };
  }
};


export const getDetaultShortcuts = (type, entities) => {
  const commonKeys = {
    next: { qualifier: "", key: "right" },
    previous: { qualifier: "", key: "left" },
    skip: { qualifier: "ctrl", key: "q" },
    moveToDone: { qualifier: "ctrl", key: "enter" }
  };
  const posKeys = {
    left: { qualifier: "", key: "q" },
    right: { qualifier: "", key: "w" }
  };
  const docKeys = {
    close: { qualifier: "", key: "esc" },
    save: { qualifier: "", key: "enter" }
  };
  const polyKeys = {
    tool: { qualifier: "", key: "space" },
    delete: { qualifier: "", key: "backspace" },
    clearAll: { qualifier: "ctrl", key: "x" },
    undo: { qualifier: "ctrl", key: "z" }
  };
  const videoKeys = {
    forward: { qualifier: "", key: "]" },
    backward: { qualifier: "", key: "[" },
    fast_forward: { qualifier: "", key: "}" },
    fast_backward: { qualifier: "", key: "{" },
    delete: { qualifier: "", key: "backspace" },
    clearAll: { qualifier: "ctrl", key: "x" },
    undo: { qualifier: "ctrl", key: "z" }
  };
  const boundKeys = { tool: { qualifier: "", key: "space" } };
  const entityKeys = {};
  if (entities) {
    for (let index = 0; index < entities.length && index < 10; index++) {
      if (index === 9) {
        entityKeys[entities[index]] = { qualifier: "ctrl", key: 0 };
      } else {
        entityKeys[entities[index]] = {
          qualifier: "ctrl",
          key: `${index + 1}`
        };
      }
    }
  }
  if (type === POS_TAGGING) {
    return { ...commonKeys, ...posKeys, ...entityKeys };
  } else if (type === DOCUMENT_ANNOTATION || type === POS_TAGGING_GENERIC) {
    return { ...commonKeys, ...docKeys };
  } else if (
    type === IMAGE_POLYGON_BOUNDING_BOX ||
    type === IMAGE_POLYGON_BOUNDING_BOX_V2
  ) {
    return { ...commonKeys, ...polyKeys, ...entityKeys };
  } else if (type === IMAGE_BOUNDING_BOX) {
    return { ...commonKeys, ...boundKeys };
  }  else if (type === VIDEO_BOUNDING_BOX) {
    return { ...commonKeys, ...videoKeys };
  }
  return { ...commonKeys, ...entityKeys };
};

export const getClassificationResult = classificationResponse => {
  let response = [];
  for (const key of Object.keys(classificationResponse)) {
    response.push({ name: key, classes: classificationResponse[key] });
  }
  console.log("classificationResponse result is", response);
  return response;
};

export const getClassificationResponse = classificationResult => {
  let response = [];
  for (let index = 0; index < classificationResult.length; index++) {
    const name = classificationResult[index].name;
    const classes = classificationResult[index].classes;
    response[name] = classes;
  }
  console.log("classificationResponse result is", response);
  return response;
};

export const checkImageURL = url => {
  return url.match(/\.(jpeg|jpg|gif|png|tif|bmp|webp|)$/) !== null;
};

export const checkVideoURL = url => {
  return url.match(/\.(webm|mp4|ogg|flac|mov)$/) !== null;
};

export const convertKeyToString = shortcut => {
  const qualifier = shortcut.qualifier;
  const key = shortcut.key;
  if (qualifier.length > 0) {
    return qualifier + "+" + key;
  } else if (qualifier.length === 0) {
    return key;
  }
};

export const createEntityColorMap = entities => {
  const colorMap = {};
  for (let index = 0; index < entities.length; index++) {
    colorMap[entities[index]] =
      ENTITY_COLORS[
        index > ENTITY_COLORS.length ? index % ENTITY_COLORS.length : index
      ];
  }
  return colorMap;
};

export const createDocEntityColorMap = entities => {
  const colorMap = {};
  if (entities !== undefined) {
    for (let index = 0; index < entities.length; index++) {
      colorMap[entities[index]] =
        DOC_ENTITY_COLORS[
          index > DOC_ENTITY_COLORS.length
            ? index % DOC_ENTITY_COLORS.length
            : index
        ];
    }
  }
  return colorMap;
};

export const timeConverter = unixTimestamp => {
  const aaa = new Date(unixTimestamp * 1000);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  const year = aaa.getFullYear();
  const month = months[aaa.getMonth()];
  const date = aaa.getDate();
  // const hour = aaa.getHours();
  // const min = aaa.getMinutes();
  // const sec = aaa.getSeconds();
  const time = date + " " + month + " " + year;
  return time;
};

export const captureException = (message) => {
    if (window.Raven) {
      alert(message);
      window.Raven.captureException(
        "Exception-Capture" +
          JSON.stringify(message)
      );
    }
}

export const posSample = {
  content: "cd players and tuners",
  annotation: [
    { label: ["Category"], points: [{ start: 0, end: 1, text: "cd" }] },
    { label: ["Category"], points: [{ start: 3, end: 9, text: "players" }] },
    { label: ["Category"], points: [{ start: 15, end: 20, text: "tuners" }] }
  ],
  extras: { Name: "columnName", Class: "ColumnValue" }
};

export const imageBoundingSample = {
  content:
    "https://s3.amazonaws.com/com.dataturks.uploads/airplanes__image_0582.jpg",
  annotation: [
    {
      label: "Airplane",
      points: [
        { x: 0.10173697270471464, y: 0.147239263803681 },
        { x: 0.9057071960297767, y: 0.7055214723926381 }
      ],
      imageWidth: 403,
      imageHeight: 135
    }
  ],
  extras: { Name: "columnName", Class: "ColumnValue" }
};

export const textClassificationJsonSample = '{ "content": "when his eye chanced to fall upon alice, as she stood watching","annotation":{"labels":["fiction"],"note":"Alice Speaking"},"extras":null,"metadata":{"first_done_at":1539871791000,"last_updated_at":1539871791000,"sec_taken":0,"last_updated_by":"eMRjkQfSKOVqTlBUJqAKuAj6Tnv1","status":"done","evaluation":"NONE"}}';


export const imagePolyBoundingSample = {
  content:
    "https://s3.amazonaws.com/com.dataturks.uploads/airplanes__image_0001.jpg",
  annotation: [
    {
      label: "Airplane",
      points: [
        [0.2500753738173288, 0.20270832379659018],
        [0.34806532356607256, 0.4579166571299235],
        [0.6143969818575299, 0.40583332379659015],
        [0.7400251225610475, 0.42145832379659015],
        [0.7927889416565248, 0.5620833237965902],
        [0.8681658260786353, 0.6245833237965902],
        [0.8983165798474796, 0.7131249904632568],
        [0.8204271326112986, 0.7443749904632568],
        [0.7274623084906957, 0.7704166571299235],
        [0.6093718562293892, 0.7235416571299235],
        [0.551582911505771, 0.7443749904632568],
        [0.4762060270836605, 0.8016666571299235],
        [0.43097989643039414, 0.7443749904632568],
        [0.34304019793793183, 0.7027083237965902],
        [0.23248743411883638, 0.7131249904632568],
        [0.1420351728123037, 0.6766666571299235],
        [0.09178391653089667, 0.6089583237965902],
        [0.11188441904345948, 0.44749999046325683],
        [0.16967336376707756, 0.4579166571299235],
        [0.14957286125451477, 0.3172916571299235],
        [0.1420351728123037, 0.2079166571299235],
        [0.25510049944546953, 0.19749999046325683],
        [0.2500753738173288, 0.20270832379659018]
      ],
      imageWidth: 398,
      imageHeight: 164
    }
  ],
  extras: null
};
