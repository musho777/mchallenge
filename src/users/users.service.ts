
import { Injectable } from '@nestjs/common';
import { Client } from 'pg';
// This should be a real class/interface representing a user entity
export type User = any;

// const pool = new Pool({
//   user: 'postgres',  // Replace with your PostgreSQL username
//   host: 'localhost',      // Replace with your PostgreSQL host
//   database: 'test', // Replace with your database name
//   password: 'm585828',  // Replace with your PostgreSQL password
//   port: 5434,            // Default PostgreSQL port
// });

@Injectable()
export class UsersService {

  private client: Client;

  constructor() {
    this.client = new Client({
      user: 'postgres',  // Replace with your PostgreSQL username
      host: 'localhost',      // Replace with your PostgreSQL host
      database: 'test', // Replace with your database name
      password: 'm585828',  // Replace with your PostgreSQL password
      port: 5434,
    });
    this.client.connect();  // Make sure to connect to the PostgreSQL database
  }

  async findOne(username: string): Promise<User | undefined> {
    const res = await this.client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (res.rows.length > 0) {
      return res.rows[0];  // Returning the user from the query result
    }
    return undefined;  // If no user is found
  }
  async createUser(username: string, password: string): Promise<void> {
    // Insert the new user into the database
    await this.client.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, password],
    );
  }
  async followUser(currentUserId: number, userIdToFollow: number): Promise<void> {
    console.log(currentUserId, userIdToFollow)
    const userCheckQuery = `
      SELECT * FROM users WHERE userid IN ($1, $2)
    `;
    const userCheckResult = await this.client.query(userCheckQuery, [currentUserId, userIdToFollow]);

    if (userCheckResult.rows.length !== 2) {
      throw new Error('User not found');
    }

    // Check if the current user is trying to follow themselves
    if (currentUserId === userIdToFollow) {
      throw new Error('Cannot follow yourself');
    }

    // Check if the user is already following the target user
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
}
