<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

K-Mate Backend API - A comprehensive Korean travel information sharing platform built with NestJS.

### Features

- **Authentication**: Google OAuth 2.0 with JWT tokens and refresh token support
- **User Management**: Complete user profile management with role-based access control
- **Places**: Korean tourist attractions, restaurants, cafes with location-based search
- **Posts**: Community posts with categories (buzz, review, question)
- **Comments**: Nested commenting system
- **Interactions**: Like/dislike functionality
- **Bookmarks**: Save favorite posts
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Testing**: Comprehensive unit, integration, and E2E tests
- **Validation**: Advanced input validation with custom decorators
- **Error Handling**: Standardized error responses and global exception handling

## Environment Setup

Create a `.env` file in the server directory with the following variables:

```env
# Application Configuration
APP_PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=k_mate_db
DB_CONN_LIMIT=10

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=3600s
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# unit tests with watch mode
$ npm run test:watch

# e2e tests
$ npm run test:e2e

# integration tests
$ npm run test:integration

# test coverage
$ npm run test:cov

# run all tests
$ npm run test:all
```

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:3000/docs`
- JSON Schema: `http://localhost:3000/docs-json`

## API Endpoints

### Authentication
- `GET /auth/google` - Start Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/refresh` - Refresh access token
- `POST /auth/validate` - Validate access token

### Users
- `GET /users` - Get all users (Admin only)
- `GET /users/profile` - Get current user profile
- `GET /users/:id` - Get user by ID
- `PUT /users/profile` - Update current user profile
- `DELETE /users/:id` - Delete user (Admin only)

### Places
- `GET /places` - Get all places with pagination and filters
- `GET /places/popular` - Get popular places
- `GET /places/category/:category` - Get places by category
- `GET /places/nearby` - Get nearby places
- `GET /places/:id` - Get place by ID
- `POST /places` - Create place (Admin only)
- `PATCH /places/:id` - Update place (Admin only)
- `DELETE /places/:id` - Delete place (Admin only)

### Posts
- `GET /posts` - Get all posts with pagination and filters
- `GET /posts/popular` - Get popular posts
- `GET /posts/recent` - Get recent posts
- `GET /posts/my-posts` - Get current user posts
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create post
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

### Comments
- `GET /comments/post/:postId` - Get comments for a post
- `GET /comments/my-comments` - Get current user comments
- `GET /comments/:id` - Get comment by ID
- `POST /comments/post/:postId` - Create comment
- `PATCH /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

### Interactions
- `POST /interactions/like/:postId` - Like/unlike a post
- `POST /interactions/dislike/:postId` - Dislike/undislike a post
- `GET /interactions/post/:postId` - Get post interactions
- `GET /interactions/user/:postId` - Get user interaction for a post
- `GET /interactions/my-interactions` - Get current user interactions

### Bookmarks
- `POST /bookmarks/toggle/:postId` - Toggle bookmark for a post
- `GET /bookmarks/my-bookmarks` - Get current user bookmarks
- `GET /bookmarks/status/:postId` - Check bookmark status
- `DELETE /bookmarks/:postId` - Remove bookmark

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
