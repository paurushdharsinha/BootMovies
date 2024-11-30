const express = require('express');
const app = express();
const userModel = require("./models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const cookieParser = require('cookie-parser')
const path = require('path');
const { create } = require('domain');
const { log } = require('console');

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get("/", async (req, res) => {
    let token = req.cookies.token;

    if (token) {
        jwt.verify(token, "secret key", async (err, decoded) => {
            if (err) {
                res.cookie("token", "");
                return res.render("main", { username: null, profilePicture: null, token: null, tokenHasExpired: true });
            } else {
                let user = await userModel.findOne({ email: decoded.email });
                if (user) {
                    let defaultProfilePic = "/images/default-profile.jpg";

                    const currentTime = Math.floor(Date.now() / 1000); 
                    const tokenHasExpired = decoded.exp < currentTime; 
                    return res.render("main", { 
                        username: user.username, 
                        profilePicture: user.profilePicture || defaultProfilePic, 
                        token: token, 
                        tokenHasExpired: tokenHasExpired 
                    });
                } else {
                    return res.render("main", { username: null, profilePicture: null, token: null, tokenHasExpired: false });
                }
            }
        });
    } else {
        // If no token is found
        res.render("main", { username: null, profilePicture: null, token: null, tokenHasExpired: false });
    }
});

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.post('/create', async (req, res) => {
    let { username, email, password, age } = req.body;

    try {
        
        let existingUser = await userModel.findOne({ $or: [{ username }, { email }] });
        
        if (existingUser) {
            if (existingUser.username === username) {
                return res.render('signup', { error: 'Username is taken.' });
            }
            if (existingUser.email === email) {
                return res.render('signup', { error: 'User already exists, try logging in.' });
            }
        }

        bcrypt.genSalt(10, (err, salt) => {
            if (err) return res.send("Error in creating salt");

            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) return res.send("Error in hashing password");

                try {
                    let createdUser = await userModel.create({
                        username,
                        email,
                        password: hash,
                        age
                    });

                    let token = jwt.sign({ email: createdUser.email, username: createdUser.username }, "secret key");
                    res.cookie("token", token);
                    res.render("created");
                } catch (error) {
                    res.send("Error in creating user.");
                }
            });
        });
    } catch (error) {
        res.send("Error in finding user: " + error.message);
    }
});


app.get("/login", (req, res) => {
    res.render("login");
});

// find if the entered mail exist or not 
app.post("/login", async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.send("something went wrong !");

    bcrypt.compare(req.body.password, user.password, function (err, result) {
        if (result) {
            let token = jwt.sign({ email: user.email, username: user.username }, "secret key", { expiresIn: '1h' });
            res.cookie("token", token);
            res.redirect("/");
        } else {
            res.send("Invalid Login Credentials...");
        }
    });
});

app.get("/profile", async (req, res) => {
    let token = req.cookies.token;

    if (token) {
        jwt.verify(token, "secret key", async (err, decoded) => {
            if (err) {
                return res.redirect("/login");
            } else {
                let user = await userModel.findOne({ email: decoded.email });
                if (user) {
                    return res.render("profile", {
                        username: user.username,
                        email: user.email,
                        age: user.age,
                        profilePicture: user.profilePicture
                    });
                } else {
                    res.redirect("/login");
                }
            }
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/choose-profile-pic", (req, res) => {
    res.render("chooseProfilePic", {
        profilePictures: [
            "/images/profile1.jpg",
            "/images/profile2.jpeg",
            "/images/profile3.jpeg",
            "/images/profile4.jpeg",
            "/images/profile5.jpeg",
            "/images/profile6.wwebp",
            "/images/profile7.jpg",
            "/images/profile8.jpg",
            "/images/profile9.jpg",
            "/images/profile10.jpg"
        ]
    });
});

app.post("/choose-profile-pic", async (req, res) => {
    let token = req.cookies.token;

    if (token) {
        jwt.verify(token, "secret key", async (err, decoded) => {
            if (err) {
                return res.redirect("/login");
            } else {
                let user = await userModel.findOne({ email: decoded.email });
                if (user) {
                    user.profilePicture = req.body.profilePicture;
                    await user.save();
                    return res.redirect("/profile");
                } else {
                    res.redirect("/login");
                }
            }
        });
    } else {
        res.redirect("/login");
    }
});


// update profile 
app.post("/update-profile", async (req, res) => {
    let token = req.cookies.token;

    if (token) {
        jwt.verify(token, "secret key", async (err, decoded) => {
            if (err) {
                return res.redirect("/login");
            } else {
                let user = await userModel.findOne({ email: decoded.email });
                if (user) {
               
                    user.username = req.body.username;
                    user.email = req.body.email;
                    user.age = req.body.age;

                    if (req.body.password) {
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(req.body.password, salt);
                    }
                    await user.save();

                    const newToken = jwt.sign({ email: user.email, username: user.username }, "secret key");
                    res.cookie("token", newToken);
                    return res.redirect("/");
                } else {
                    return res.redirect("/login");
                }
            }
        });
    } else {
        res.redirect("/login");
    }
});

// logout
app.get("/logout", function (req, res) {
    res.cookie("token", "", { maxAge: 0 });
    res.redirect("/");
});

// payment route
app.get("/payment", (req, res) => {
    let token = req.cookies.token;

    if (token) {
        jwt.verify(token, "secret key", async (err, decoded) => {
            if (err) {
                return res.redirect("/login");
            } else {
                let user = await userModel.findOne({ email: decoded.email });
                if (user) {
                    return res.render("payment");
                } else {
                    return res.redirect("/login");
                }
            }
        });
    } else {
        res.redirect("/login");
    }
});

// pos route to process the payment
app.post("/payment-process", async (req, res) => {
    let token = req.cookies.token;
    const { duration } = req.body;

    if (token) {
        jwt.verify(token, "secret key", async (err, decoded) => {
            if (err) {
                return res.redirect("/login");
            } else {
                let user = await userModel.findOne({ email: decoded.email });
                if (user) {
                    let newExpiration;

                    if (duration === "1-month") {
                        newExpiration = "30d";
                    } else if (duration === "3-months") {
                        newExpiration = "90d";
                    } else if (duration === "6-months") {
                        newExpiration = "180d";
                    } else if (duration === "1-year") {
                        newExpiration = "365d";
                    }

                    let newToken = jwt.sign({ email: user.email, username: user.username }, "secret key", {
                        expiresIn: newExpiration
                    });

                    res.cookie("token", newToken);
                    res.redirect("/");
                } else {
                    res.redirect("/login");
                }
            }
        });
    } else {
        res.redirect("/login");
    }
});


app.listen(3000);
