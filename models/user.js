const mongoose = require('mongoose')

mongoose.connect( 'mongodb://127.0.0.1:27017/movies')

const userSchema = mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },  
    password: String,
    age: Number,
    profilePicture : { type: String, default: '/images/default-profile.jpg'}
});

module.exports = mongoose.model("user", userSchema); 
