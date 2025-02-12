
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
export type User = any;

@Injectable()
export class UsersService {

  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Pool) { }

  async findOne(name: string): Promise<User | undefined> {
    const res = await this.db.query('SELECT * FROM users WHERE name = $1', [name]);
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    return undefined;
  }
  async createUser(name: string, surname: string, email: string, password: string, age: number): Promise<void> {
    console.log(name, surname, email, password, age)
    await this.db.query(
      'INSERT INTO users (name, surname, email, password, age) VALUES ($1, $2, $3, $4, $5 )',
      [name, surname, email, password, age],
    );
  }
  async followUser(currentUserId: number, userIdToFollow: number): Promise<void> {
    const userCheckQuery = `
      SELECT * FROM users WHERE id IN ($1, $2)
    `;
    const userCheckResult = await this.db.query(userCheckQuery, [currentUserId, userIdToFollow]);
    if (userCheckResult.rows.length !== 2) {
      throw new Error('User not found');
    }
    if (currentUserId === userIdToFollow) {
      throw new Error('Cannot follow yourself');
    }

    const requestCheckQuery = `
      SELECT * FROM friend_requests WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
    `;
    const requestCheckResult = await this.db.query(requestCheckQuery, [currentUserId, userIdToFollow]);

    if (requestCheckResult.rows.length > 0) {
      throw new Error('Friend request already sent or received');
    }

    const insertRequestQuery = `
      INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ($1, $2, 'pending')
    `;
    await this.db.query(insertRequestQuery, [currentUserId, userIdToFollow]);
  }

  async acceptFriendRequest(currentUserId: number, userIdToAccept: number): Promise<void> {
    const requestCheckQuery = `
      SELECT * FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'
    `;
    const requestCheckResult = await this.db.query(requestCheckQuery, [userIdToAccept, currentUserId]);

    if (requestCheckResult.rows.length === 0) {
      throw new Error('No pending friend request found');
    }

    const updateRequestQuery = `
      UPDATE friend_requests SET status = 'accepted' WHERE sender_id = $1 AND receiver_id = $2
    `;
    await this.db.query(updateRequestQuery, [userIdToAccept, currentUserId]);

    const insertFriendQuery = `
      INSERT INTO friends (user_id, friend_id) VALUES ($1, $2), ($2, $1)
    `;
    await this.db.query(insertFriendQuery, [userIdToAccept, currentUserId]);
  }

  async declineFriendRequest(currentUserId: number, userIdToDecline: number): Promise<void> {
    const requestCheckQuery = `
      SELECT * FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'
    `;
    const requestCheckResult = await this.db.query(requestCheckQuery, [userIdToDecline, currentUserId]);

    if (requestCheckResult.rows.length === 0) {
      throw new Error('No pending friend request found');
    }

    const updateRequestQuery = `
      UPDATE friend_requests SET status = 'declined' WHERE sender_id = $1 AND receiver_id = $2
    `;
    await this.db.query(updateRequestQuery, [userIdToDecline, currentUserId]);
  }

  async getPendingRequests(userId: number): Promise<any[]> {
    const query = `
    SELECT fr.*, u.id AS user_id, u.name AS user_name, u.email AS user_email
    FROM friend_requests fr
    JOIN users u ON u.id = fr.sender_id
    WHERE fr.receiver_id = $1 AND fr.status = 'pending'
  `;
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }


  async searchUsers(query: string): Promise<any[]> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE name ILIKE $1 OR surname ILIKE $1 OR CAST(age AS TEXT) ILIKE $1',
      [`%${query}%`]
    );
    return result.rows;
  }


}
