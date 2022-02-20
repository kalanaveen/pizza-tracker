require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('express-flash');
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const MongoDbStore = require('connect-mongo')(session);
const passport = require('passport');
const Emitter = require('events');

// mongodb connection 
const CONNECTION_URL = process.env.DATABASE_URL

mongoose.connect(
    CONNECTION_URL,
    { useNewUrlParser: true, useFindAndModify: true, useUnifiedTopology: true ,useCreateIndex:true},
    () => {
      console.log("Mongoose Connected");
    }
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(flash());

  // session store 
let mongoStore = new MongoDbStore({
  mongooseConnection:mongoose.connection,
  collection:'sessions',
});

// event emitter 
const eventEmitter = new Emitter();
app.set('eventEmitter',eventEmitter);
// session config
app.use(session({
  secret:process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  store:mongoStore,
  cookie: { maxAge:1000*60*60*24 } //24hours
}))

  const passportInit = require('./app/config/passport');
  passportInit(passport);
  // passport config 
  app.use(passport.initialize())
  app.use(passport.session());


// global middleware 
app.use((req,res,next)=>{
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

// assests
app.use(express.static('public'));

// set template engine 
app.use(expressLayouts);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

require('./routes/web')(app);
app.use((req,res)=>{
    res.status(404).render('errors/404');
})

// server running
const server = app.listen(PORT, () => {
console.log(`server running on port:${PORT}`)
});

const io = require('socket.io')(server);

io.on('connection',(socket)=>{
  //join
  socket.on('join',(roomName)=>{
     socket.join(roomName)
  })
})

eventEmitter.on('orderUpdated',(data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced',(data)=>{
  io.to('adminRoom').emit('orderPlaced',data)
})