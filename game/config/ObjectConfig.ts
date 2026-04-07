export type GameplayObjectId =
  | 'strawberry'
  | 'cherry'
  | 'grape'
  | 'blueberry'
  | 'raspberry'
  | 'apple'
  | 'orange'
  | 'peach'
  | 'plum'
  | 'kiwi'
  | 'lemon'
  | 'lime'
  | 'mango'
  | 'watermelon'
  | 'pineapple'
  | 'coconut'
  | 'banana'
  | 'dragonfruit'
  | 'starfruit'
  | 'pomegranate'
  | 'numAnsom'
  | 'numKrok'
  | 'numKum';

export type ObjectSetId = 'default' | 'khmerSongkran';

export interface GameplayObjectDef {
  id: GameplayObjectId;
  radius: number;
  baseScore: number;
  weight: number;
}

const GAMEPLAY_OBJECTS: Record<GameplayObjectId, GameplayObjectDef> = {
  strawberry: { id: 'strawberry', radius: 30, baseScore: 1, weight: 3 },
  cherry: { id: 'cherry', radius: 28, baseScore: 1, weight: 3 },
  grape: { id: 'grape', radius: 28, baseScore: 1, weight: 3 },
  blueberry: { id: 'blueberry', radius: 26, baseScore: 1, weight: 3 },
  raspberry: { id: 'raspberry', radius: 26, baseScore: 1, weight: 3 },
  apple: { id: 'apple', radius: 36, baseScore: 1, weight: 3 },
  orange: { id: 'orange', radius: 36, baseScore: 2, weight: 2 },
  peach: { id: 'peach', radius: 36, baseScore: 2, weight: 2 },
  plum: { id: 'plum', radius: 34, baseScore: 2, weight: 2 },
  kiwi: { id: 'kiwi', radius: 32, baseScore: 2, weight: 2 },
  lemon: { id: 'lemon', radius: 30, baseScore: 2, weight: 2 },
  lime: { id: 'lime', radius: 28, baseScore: 2, weight: 2 },
  mango: { id: 'mango', radius: 40, baseScore: 2, weight: 2 },
  watermelon: { id: 'watermelon', radius: 48, baseScore: 3, weight: 1 },
  pineapple: { id: 'pineapple', radius: 44, baseScore: 3, weight: 1 },
  coconut: { id: 'coconut', radius: 40, baseScore: 3, weight: 1 },
  banana: { id: 'banana', radius: 34, baseScore: 3, weight: 1 },
  dragonfruit: { id: 'dragonfruit', radius: 40, baseScore: 3, weight: 1 },
  starfruit: { id: 'starfruit', radius: 42, baseScore: 3, weight: 1 },
  pomegranate: { id: 'pomegranate', radius: 42, baseScore: 3, weight: 1 },
  numAnsom: { id: 'numAnsom', radius: 42, baseScore: 2, weight: 3 },
  numKrok: { id: 'numKrok', radius: 40, baseScore: 2, weight: 3 },
  numKum: { id: 'numKum', radius: 36, baseScore: 3, weight: 3 },
};

const OBJECT_SETS: Record<ObjectSetId, GameplayObjectId[]> = {
  default: [
    'strawberry',
    'cherry',
    'grape',
    'blueberry',
    'raspberry',
    'apple',
    'orange',
    'peach',
    'plum',
    'kiwi',
    'lemon',
    'lime',
    'mango',
    'watermelon',
    'pineapple',
    'coconut',
    'banana',
    'dragonfruit',
    'starfruit',
    'pomegranate',
  ],
  khmerSongkran: ['numAnsom', 'numKrok', 'numKum'],
};

export function getObjectRules(objectId: GameplayObjectId): GameplayObjectDef {
  return GAMEPLAY_OBJECTS[objectId];
}

export function getObjectSet(setId: ObjectSetId): GameplayObjectDef[] {
  return OBJECT_SETS[setId].map((id) => GAMEPLAY_OBJECTS[id]);
}

export { GAMEPLAY_OBJECTS, OBJECT_SETS };
