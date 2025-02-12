# User Authentication and Social API

## Overview
This project is a backend API built with **NestJS** for managing users, authentication, and social interactions (such as following other users). The API uses **PostgreSQL** as the database, **JWT (JSON Web Tokens)** for user authentication, and **bcrypt** for password hashing.

## Technologies Used
- **NestJS**: A progressive Node.js framework for building scalable server-side applications.
- **PostgreSQL**: A powerful relational database used to store user data and social interactions.
- **JWT**: Used for secure authentication and authorization of users.
- **bcrypt**: Used to hash passwords before storing them in the database.

## System Architecture

The system follows a modular architecture with the following key components:

- **Auth Module**: Handles authentication, user login, and JWT generation.
- **User Module**: Manages user data, including user profile creation, and searching users.
- **Followers Module**: Manages user following functionality.
- **Database**: PostgreSQL stores the user and follower data.

### Application Flow
1. **Sign In**: Users can log in by providing a username and password.
2. **Search Users**: Users can search for other users by username.
3. **Follow Users**: Users can follow other users by sending a `POST` request with the target user’s username.

---

## Installation

### Prerequisites
- **Node.js**: Ensure you have [Node.js](https://nodejs.org/) installed.
- **PostgreSQL**: Install PostgreSQL and set up a database for the application.
- **Postman**: Used for testing API endpoints.

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/musho777/mchallenge.git
