import { config } from 'dotenv';
config();

import '@/ai/flows/perfume-description-generator.ts';
import '@/ai/flows/perfume-recommendation.ts';
import '@/ai/flows/chat-flow.ts';
import '@/ai/schema/perfume-description-schema';
import '@/ai/schema/perfume-recommendation-schema';
import '@/ai/schema/chat-schema';
