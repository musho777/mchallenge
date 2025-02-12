
import { Injectable } from '@nestjs/common';
import { Client } from 'pg';
export type User = any;

@Injectable()
export class UsersService {

  private client: Client;

  constructor() {
    this.client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'test',
      password: 'm585828',
      port: 5434,
    });
    this.client.connect();
  }

  async findOne(name: string): Promise<User | undefined> {
    const res = await this.client.query('SELECT * FROM users WHERE name = $1', [name]);
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    return undefined;
  }
  async createUser(name: string, surname: string, email: string, password: string, age: number): Promise<void> {
    console.log(name, surname, email, password, age)
    await this.client.query(
      'INSERT INTO users (name, surname, email, password, age) VALUES ($1, $2, $3, $4, $5 )',
      [name, surname, email, password, age],
    );
  }
  async followUser(currentUserId: number, userIdToFollow: number): Promise<void> {
    const userCheckQuery = `
      SELECT * FROM users WHERE id IN ($1, $2)
    `;
    const userCheckResult = await this.client.query(userCheckQuery, [currentUserId, userIdToFollow]);
    if (userCheckResult.rows.length !== 2) {
      throw new Error('User not found');
    }
    if (currentUserId === userIdToFollow) {
      throw new Error('Cannot follow yourself');
    }

    const requestCheckQuery = `
      SELECT * FROM friend_requests WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
    `;
    const requestCheckResult = await this.client.query(requestCheckQuery, [currentUserId, userIdToFollow]);

    if (requestCheckResult.rows.length > 0) {
      throw new Error('Friend request already sent or received');
    }

    const insertRequestQuery = `
      INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ($1, $2, 'pending')
    `;
    await this.client.query(insertRequestQuery, [currentUserId, userIdToFollow]);
  }

  async acceptFriendRequest(currentUserId: number, userIdToAccept: number): Promise<void> {
    const requestCheckQuery = `
      SELECT * FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'
    `;
    const requestCheckResult = await this.client.query(requestCheckQuery, [userIdToAccept, currentUserId]);

    if (requestCheckResult.rows.length === 0) {
      throw new Error('No pending friend request found');
    }

    const updateRequestQuery = `
      UPDATE friend_requests SET status = 'accepted' WHERE sender_id = $1 AND receiver_id = $2
    `;
    await this.client.query(updateRequestQuery, [userIdToAccept, currentUserId]);

    const insertFriendQuery = `
      INSERT INTO friends (user_id, friend_id) VALUES ($1, $2), ($2, $1)
    `;
    await this.client.query(insertFriendQuery, [userIdToAccept, currentUserId]);
  }

  async declineFriendRequest(currentUserId: number, userIdToDecline: number): Promise<void> {
    // Check if the friend request exists and is pending
    const requestCheckQuery = `
      SELECT * FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'
    `;
    const requestCheckResult = await this.client.query(requestCheckQuery, [userIdToDecline, currentUserId]);

    if (requestCheckResult.rows.length === 0) {
      throw new Error('No pending friend request found');
    }

    // Update the status to declined
    const updateRequestQuery = `
      UPDATE friend_requests SET status = 'declined' WHERE sender_id = $1 AND receiver_id = $2
    `;
    await this.client.query(updateRequestQuery, [userIdToDecline, currentUserId]);
  }

  async getPendingRequests(userId: number): Promise<any[]> {
    console.log(userId, 'userId')
    const query = `
    SELECT fr.*, u.id AS user_id, u.name AS user_name, u.email AS user_email
    FROM friend_requests fr
    JOIN users u ON u.id = fr.sender_id
    WHERE fr.receiver_id = $1 AND fr.status = 'pending'
  `;
    const result = await this.client.query(query, [userId]);
    return result.rows;
  }


  async searchUsers(query: string): Promise<any[]> {
    console.log(query, 'query')
    const result = await this.client.query(
      'SELECT * FROM users WHERE name ILIKE $1 OR surname ILIKE $1 OR CAST(age AS TEXT) ILIKE $1',
      [`%${query}%`]
    );
    return result.rows;
  }


}
