
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
      SELECT * FROM users WHERE userid IN ($1, $2)
    `;
    const userCheckResult = await this.client.query(userCheckQuery, [currentUserId, userIdToFollow]);

    if (userCheckResult.rows.length !== 2) {
      throw new Error('User not found');
    }
    if (currentUserId === userIdToFollow) {
      throw new Error('Cannot follow yourself');
    }
    const followCheckQuery = `
      SELECT * FROM followers WHERE userid = $1 AND followerid = $2
    `;
    const followCheckResult = await this.client.query(followCheckQuery, [userIdToFollow, currentUserId]);

    if (followCheckResult.rows.length > 0) {
      throw new Error('You are already following this user');
    }

    // Add the follower relationship
    const insertFollowQuery = `
      INSERT INTO followers (userid, followerid) VALUES ($1, $2)
    `;
    await this.client.query(insertFollowQuery, [userIdToFollow, currentUserId]);
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
