//jshint esversion:6
//This configure whatsoever in .env to be available in this app.js
//To access it here we use process.env.API_KEY 
//~require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")
//const encrypt = require("mongoose-encryption");
const mongoose = require("mongoose");
//const md5 = require('md5');
const app = express();



app.use(express.static("Public"))
app.set('view engine', "ejs")
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret: "Our little secret",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize());//Authentication
app.use(passport.session());//Session












mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});


const userSchema = new mongoose.Schema({
    email:String,//you change it to username to check something
    password:String,
});
userSchema.plugin(passportLocalMongoose);


//It's important to add the plug in middleware before creating model below

//userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});

const User = new mongoose.model("User",userSchema);
passport.use(User.createStrategy());
//Order is very important for session use
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get('/',function(req,res){
    res.render("home")
})
app.get('/login',function(req,res){
    res.render("login")
})
app.get('/register',function(req,res){
    res.render("register")
})
app.get('/secrets', (req,res)=>{
// To check if the user is logged in using passport and others
if(req.isAuthenticated()){
    res.render("secrets")
} else {
    res.redirect("/register");
}
})

app.get('/logout',(req,res)=>{
    //  Where deauthentication happens
    req.logout((err)=>{
        if(!err){
            res.redirect('/')
        } else {
            console.log(error)
        }
    });
    
})


//plaintextoffender.com 
//password-checker.online-domain-tools.com
app.post("/register",(req,res)=>{
    
   User.register({username:req.body.username},req.body.password,(err,user)=>{
    if(err){
        console.log(err);
        res.redirect("/register")
    } else {
        passport.authenticate("local")(req,res, function(){
         res.redirect("/secrets");
        })
    }
   })
    
    
    
})
//to log a user in 
app.post('/login',(req,res)=>{
const user = new User ({
    username:req.body.username,
    password:req.body.password,

})
//comes from passport
req.login(user, (err)=>{
if(err){
    console.log(err)
} else {
    passport.authenticate("local")(req,res,()=>{
        res.redirect("/secrets");
    })
}
})
})
app.listen(4000,()=>{
    console.log("Server is up and running");
})
//To  do list
//cookies are used to save browsing session
//mnpm install the following
//passport
//passport-local
//passport-local-mongoose
//express-session 
//bcrypt`