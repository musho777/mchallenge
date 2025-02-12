import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DATABASE_CONNECTION } from '../database/database.module';
import { Client } from 'pg';

describe('UsersService', () => {
  let service: UsersService;
  let client: Client;

  beforeEach(async () => {
    client = new Client();
    client.query = jest.fn().mockResolvedValue({ rows: [] });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DATABASE_CONNECTION,
          useValue: client,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: 1, name: 'John' };
      (client.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

      const result = await service.findOne('John');
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when no user is found', async () => {
      (client.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await service.findOne('Unknown');
      expect(result).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('should insert a new user into the database', async () => {
      await service.createUser('John', 'Doe', 'john@example.com', 'password123', 30);
      expect(client.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, surname, email, password, age) VALUES ($1, $2, $3, $4, $5)',
        ['John', 'Doe', 'john@example.com', 'password123', 30]
      );
    });
  });

  describe('followUser', () => {
    it('should insert a new friend request when valid', async () => {
      (client.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] })
        .mockResolvedValueOnce({ rows: [] });

      await service.followUser(1, 2);
      expect(client.query).toHaveBeenCalledWith(
        'INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ($1, $2, \'pending\')',
        [1, 2]
      );
    });
  });

  describe('acceptFriendRequest', () => {
    it('should update friend request and add to friends', async () => {
      (client.query as jest.Mock).mockResolvedValueOnce({ rows: [{ sender_id: 1, receiver_id: 2 }] });
      await service.acceptFriendRequest(2, 1);
      expect(client.query).toHaveBeenCalledWith(
        "UPDATE friend_requests SET status = 'accepted' WHERE sender_id = $1 AND receiver_id = $2",
        [1, 2]
      );
    });
  });

  describe('declineFriendRequest', () => {
    it('should update friend request status to declined', async () => {
      (client.query as jest.Mock).mockResolvedValueOnce({ rows: [{ sender_id: 1, receiver_id: 2 }] });
      await service.declineFriendRequest(2, 1);
      expect(client.query).toHaveBeenCalledWith(
        "UPDATE friend_requests SET status = 'declined' WHERE sender_id = $1 AND receiver_id = $2",
        [1, 2]
      );
    });
  });

  describe('getPendingRequests', () => {
    it('should return pending friend requests', async () => {
      const mockRequests = [{ id: 1, sender_id: 2, receiver_id: 1, status: 'pending' }];
      (client.query as jest.Mock).mockResolvedValue({ rows: mockRequests });

      const result = await service.getPendingRequests(1);
      expect(result).toEqual(mockRequests);
    });
  });

  describe('searchUsers', () => {
    it('should return matched users', async () => {
      const mockUsers = [{ id: 1, name: 'John Doe', age: 30 }];
      (client.query as jest.Mock).mockResolvedValue({ rows: mockUsers });

      const result = await service.searchUsers('John');
      expect(result).toEqual(mockUsers);
    });
  });
});
