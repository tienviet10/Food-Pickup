
<h1 align="center">
  <br>
  Food Pick-up Ordering Project
  <br>
</h1>

<h4 align="center">Food Pick-up Ordering is a full stack web application built with <a href="https://nodejs.org/en/">Node.js</a> and <a href="https://expressjs.com/">Express.js</a> that allows users to create pick up orders for their favorite restaurants.</h4>

<p align="center">
  <a href="#final-product">Final Product</a> •
  <a href="#dependencies">Dependencies</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#acknowledgement">Acknowledgement</a>
</p>


## Final Product
1. Home Page:

<p align="center">
  <img src="https://user-images.githubusercontent.com/70352144/219830594-544df17c-c820-4aab-98e3-cd2245b7cea6.gif">
</p>

2. Menu page (Customer view):
  - Stripe payment (add a new credit card or use a stored credit card)
  - Custom middleware to protect routes

<p align="center">
  <img src="https://user-images.githubusercontent.com/70352144/219830872-a23d4ed3-3114-4548-bc17-252a40400abe.gif">
</p>

3. Restaurant owner (Rstaurant view):
  - Ordering system powered by a real-time, bi-directional communication (<a href="https://socket.io">Socket.io</a>)
  - Live in-app notification with <a href="https://socket.io">Socket.io</a>
  - Schedule jobs for execution at specific dates (<a href="https://www.npmjs.com/package/node-schedule">node-schedule</a>)

4. SMS Message (notification):
  - SMS communication through a modern telecomm API (<a href="https://www.twilio.com/">Twilio</a>)


## Dependencies

**Dependencies**

- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [EJS](https://ejs.co/)
- [bcryptjs](https://github.com/kelektiv/node.bcrypt.js#readme)
- [cookie-session](https://github.com/expressjs/cookie-session#readme)
- [chalk](https://github.com/chalk/chalk#readme)
- [dotenv](https://github.com/motdotla/dotenv#readme)
- [morgan](https://github.com/expressjs/morgan#readme)
- [node-schedule](https://github.com/node-schedule/node-schedule#readme)
- [pg](https://node-postgres.com/)
- [socket.io](https://socket.io/)
- [stripe](https://stripe.com/en-ca)
- [twilio](https://www.twilio.com/)

**Dev-dependencies**
- [Nodemon](https://nodemon.io/)

## Getting Started

**Prerequisites:**

* [Git](https://git-scm.com) 
* [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) 10.x or more
* [psql](https://www.postgresql.org/docs/current/app-psql.html)


**Server:**

1. Connect to your postgres server

```sh
$ psql -U vagrant -d template1
```

2. Create the necessary objects in the Database

```sh
$ CREATE ROLE labber WITH LOGIN password 'labber';
$ CREATE DATABASE midterm OWNER labber;
```

3. Create a folder and clone this repository

```sh
$ git clone https://github.com/tienviet10/Food-Pickup.git
```

4. Move to the correct directory

```sh
$ cd Food-Pickup
```

5. Install dependencies

```sh
$ npm install
```

6. Create a .env file according to the template below

```sh
STRIPE_PRIVATE_KEY=
SESSIONKEY1=
SESSIONKEY2=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE=
DB_HOST=localhost
DB_USER=labber
DB_PASS=labber
DB_NAME=midterm
DB_PORT=5432
API=http://localhost:8080/
```

7. Reset the database

```sh
$ npm run db:reset
```

8. Run the development web server

```sh
$ npm run local
```


## Deployment
- Deployed to <a href="https://railway.app/">Railway.app</a>
- Postgres Database hosted by <a href="https://railway.app/">Railway.app</a>.

## Acknowledgement
- Home page and restaurant page was created based on a template designed by <a href="https://htmlcodex.com">HTML Codex</a> and distributed by <a href="https://themewagon.com">ThemeWagon</a>.
- Login page and registration page were created based on a template designed by <a href="https://colorlib.com/wp/template/colorlib-regform-8/">Rok Krivec</a>
