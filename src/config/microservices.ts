import dotenv from 'dotenv';

dotenv.config();

export interface MicroserviceConfig {
  path: string;
  url: string;
}

export const microservices: Record<string, MicroserviceConfig> = {
  player: {
    path: '/player',
    url: process.env.PLAYER_SERVICE_URL || 'http://localhost:3001',
  },
  auth: {
    path: '/auth',
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:4007/api/v1/auth',
  },
  battle: {
    path: '/battle',
    url: process.env.BATTLE_SERVICE_URL || 'http://localhost:3003',
  },
  save: {
    path: '/save',
    url: process.env.SAVE_SERVICE_URL || 'http://localhost:3004',
  },
  user: {
    path: '/user',
    url: process.env.USER_SERVICE_URL || 'http://localhost:3005',
  },
  dungeon: {
    path: '/dungeon',
    url: process.env.DUNGEON_SERVICE_URL || 'http://localhost:3006',
  },
  brainrot: {
    path: '/brainrot',
    url: process.env.BRAINROT_SERVICE_URL || 'http://localhost:3007',
  },
  item: {
    path: '/item',
    url: process.env.ITEM_SERVICE_URL || 'http://localhost:3008',
  }
};

export default microservices;
