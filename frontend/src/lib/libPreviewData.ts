import { mockNeuralSearchScan } from './scanData';

export { mockNeuralSearchScan };

export const mockUser = {
  id: 'preview-user',
  name: 'Alex Chen',
  email: 'alex@reposight.dev',
  occupation: 'professional' as const,
  techStack: ['Python', 'TypeScript', 'React', 'FastAPI'],
  githubUsername: 'alexchen',
  avatarUrl: undefined,
  createdAt: '2026-09-08T00:00:00.000Z',
};

export const mockRepos = [
  {
    id: '1',
    name: 'neural-search',
    fullName: 'alexchen/neural-search',
    language: 'Python',
    stars: 342,
    forks: 28,
    lastScanned: '2026-09-08',
    scanStatus: 'completed' as const,
    description: 'Semantic search engine using embeddings',
    lastScan: mockNeuralSearchScan,
  },
  {
    id: '2',
    name: 'fastapi-gateway',
    fullName: 'alexchen/fastapi-gateway',
    language: 'Python',
    stars: 89,
    forks: 12,
    scanStatus: 'idle' as const,
    description: 'API gateway with auth and rate limiting',
  },
  {
    id: '3',
    name: 'react-dashboard',
    fullName: 'alexchen/react-dashboard',
    language: 'TypeScript',
    stars: 156,
    forks: 34,
    scanStatus: 'idle' as const,
    description: 'Analytics dashboard with real-time updates',
  },
];