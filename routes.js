// const { application } = require("express");
const express = require("express");
const fs = require("fs")
const mongoose = require("mongoose")
const registerModel = require("./schema/Register-schema")
const postModel = require("./schema/post-schema")
const commentModel = require("./schema/comment-schema")
const path = require("path")
const router = express.Router();
// const cors = require("cors")


// const cookieParser = require("cookie-parser");
// router.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: true,
// }));
// router.use(cookieParser());

//multer is used for client selected img automatically uploads in our local file
const multer = require("multer")
// const mul = require("../client/public/uploads")
// const uplodeMiddleware = multer({ dest: "../client/public/uploads" })
const uplodeMiddleware = multer({ dest: "./uploads" })
// dest: "./uploads",
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads');
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname);
//     }
// });

// const uplodeMiddleware = multer({ storage: storage })

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/')
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, file.fieldname + '-' + uniqueSuffix)
//     }
// })

// const uplodeMiddleware = multer({ storage: storage })

const bcrypt = require("bcrypt")
var jwt = require('jsonwebtoken');
const { log } = require("console");


//secret key is for an generate an jwt token
let secret = process.env.JWT_CODE;

//this salt variable used for to encrypt an password along with bcrypt module
let salt = bcrypt.genSaltSync(10);

// static files
router.use("/uploads", express.static(path.join(__dirname + '/uploads')))


//for creating new users
router.post("/register", async (req, res) => {
    let { username, number, email, password } = req.body.data;
    try {
        const userDocs = new registerModel({
            username,
            number,
            email,
            password: bcrypt.hashSync(password, salt)
        })

        res.status(202).json(userDocs)
        userDocs.save()
    } catch (e) {
        res.status(404).json(e)
    }
})

//for login existing users

router.post("/login", async (req, res) => {
    // console.log(req.body);
    let { email, password } = req.body.datas;
    let regDetails = await registerModel.findOne({ email: email });
    // console.log("regDetails :", regDetails);
    if (regDetails) {
        let passOk = bcrypt.compareSync(password, regDetails.password)
        if (passOk) {
            // console.log("pass :", passOk);
            jwt.sign({ username: regDetails.username, userId: regDetails._id }, secret, (err, token) => {
                if (err) throw err;
                // res.cookie('token', token).json({ id: regDetails._id, username: regDetails.username })
                // res.cookie('token', token)
                // console.log("cokkies", cookies);
                // let session = res.session;
                let session = req.session;
                // session.cookie.token = token
                // session.cookie.userDetails = regDetails
                // 
                session.token = token;
                session.userInfo = regDetails
                console.log("sesson from login", session);
                req.session.save()
                // session.save()
                // session.userInfo = regDetails;
                // req.session.save = regDetails;
                // res.session('usrname', token)
                // sessionStorage.setItem("token", regDetails);
                // console.log(session);
                // console.log(token);
                // console.log("cocokie", JSON.stringify(req.cookies));
                // console.log("cocokie-2", req.session);

                res.status(200).json({ id: regDetails._id, username: regDetails.username, session })
            })
        } else {
            res.status(404).json("Access Denied")
        }
    } else {
        res.status(404).json("Access Denied")
    }
})


//for create post datas in frontend fetch an data into backend 
// [{ name: 'userPhoto' }, { name: 'postImg' }]
router.post("/createpost", uplodeMiddleware.fields([{ name: 'userPhoto' }, { name: 'postImg' }]), async (req, res) => {
    // console.log(req.files.userPhoto[0]);
    let { originalname, path } = req.files.userPhoto[0];
    let { originalname: postImgName, path: postImgPath } = req.files.postImg[0];

    console.log(originalname, path);
    console.log(postImgName, postImgPath);

    const parts1 = originalname.split(".")
    const parts2 = postImgName.split(".")
    // console.log(parts);
    const userPhotoExt = parts1[parts1.length - 1]
    const postImgExt = parts2[parts2.length - 1]

    // console.log(ext);
    const newUserPhotoPath = path + '.' + userPhotoExt;
    const newPostImgPath = postImgPath + '.' + postImgExt;

    // console.log(newPath);
    fs.renameSync(path, newUserPhotoPath)
    fs.renameSync(postImgPath, newPostImgPath)

    // console.log(req.body)
    // console.log();
    // res.send("hii")
    let { title, userName, content } = req.body;
    // let { content } = req.body.datas

    let dataItems = await postModel.create({
        title,
        userPhoto: newUserPhotoPath.slice(8),
        userName,
        postImg: newPostImgPath.slice(8),
        postContent: content
    })
    res.status(201).json(dataItems)


})



//to fetch all created post and send to frontend content section
router.get("/fetchdPosts", async (req, res) => {
    // let session = req.session;
    // console.log(session);
    // res.status(200).json(session)
    // console.log("coookies-", JSON.stringify(req.session))
    let fetchAllPosts = await postModel.find()
    res.status(200).json(fetchAllPosts)

})


//to fetch an serached text from sidebar ciomponent
router.get("/search/:searchedData", async (req, res) => {
    // console.log(req.body);
    let data = req.params.searchedData;
    // let fetchAllPosts = await postModel.find({ title: { $search: "goes" } })
    // let fetchAllPosts = await postModel.find({ title: /."*$data".*/i })
    //let fetchAllPosts = await postModel.find({ title: data })
    let fetchAllPosts = await postModel.find({ title: { $regex: `${data}`, $options: 'i' } })
    // let fetchAllPosts = await postModel.find({ title:{ /.*data.*/i} })
    // let fetchAllPosts = await postModel.find({ "title": { $regex: "/^" + data + "/" } })



    // "$text": { "$search": "brown fox" }
    res.status(200).json(fetchAllPosts)
    // res.send(fetchAllPosts)
})
// router.get("/searchedtext", async (req, res) => {
//     console.log("hiii");
//     res.json(req)
// })


//to garp an single post when user click view more
router.post("/singlepostcontent", async (req, res) => {

    // console.log(req.body);
    // res.json(req.body)
    let data = req.body.post_id;
    // let convertId = new mongodb.objectId(data)
    let singlePostDatas = await postModel.findById({ _id: data })

    res.status(200).json(singlePostDatas)

})

router.post("/commentsData", async (req, res) => {
    let { name, email, message } = req.body[0].commentdata;
    // console.log(req.body);
    // console.log(name, email, message);
    let { postCommentId } = req.body[1];
    // console.log(postCommentId)
    // console.log(req.body[1]);
    let newCommentData = await commentModel({
        username: name,
        email,
        message,
        postCommentId
    })
    newCommentData.save()
    res.status(201).json(newCommentData)
})

//fetch all data in to comment database
router.get("/fetchcommentsData", async (req, res) => {
    let fetchDataToComments = await commentModel.find()
    res.status(200).json(fetchDataToComments)
})

//for acess an sessions
// router.get("/loading", (req, res) => {

// })

// GET /logout
router.get('/logout', (req, res) => {


    if (req.session) {

        req.session.destroy((error) => {
            if (error) {
                console.log(error);
            }

        });
        res.send("loggout")
    }
});



//for adminpanel
router.get("/viewusers", async (req, res) => {
    let viewUsers = await registerModel.find();
    res.status(200).json(viewUsers)
})

router.get("/viewposts", async (req, res) => {
    let viewPosts = await postModel.find();
    res.status(200).json(viewPosts)
})

//del user from adminpanel
router.post("/deleteuserfromadmin", async (req, res) => {
    let del_id = req.body.userParams;
    console.log(del_id);
    let data = await registerModel.findByIdAndDelete({ _id: del_id })
    res.status(200).json(data)
})

//del post from adminpanel
router.post("/deletepostfromadmin", async (req, res) => {
    let del_id = req.body.postParams;
    console.log(del_id);
    let data = await postModel.findByIdAndDelete({ _id: del_id })
    res.status(200).json(data)
})

//del post from adminpanel
router.post("/deletecommentfromadmin", async (req, res) => {
    let del_id = req.body.commentParams;
    console.log(del_id);
    let data = await commentModel.findByIdAndDelete({ _id: del_id })
    res.status(200).json(data)
})


//fetch data from post according to their id
router.post("/editpost", async (req, res) => {
    // console.log(req.body.postParams);
    let post_id = req.body.postParams;
    // console.log(post_id);
    let post = await postModel.findById({ _id: post_id })
    res.status(200).json(post)
})
//when update an post
router.post("/validateEditPost", uplodeMiddleware.fields([{ name: 'userPhoto' }, { name: 'postImg' }]), async (req, res) => {
    // console.log(req.body);
    console.log(req.files);

    let { originalname, path } = req.files.userPhoto[0];
    let { originalname: postImgName, path: postImgPath } = req.files.postImg[0];

    console.log(originalname, path);
    console.log(postImgName, postImgPath);

    const parts1 = originalname.split(".")
    const parts2 = postImgName.split(".")
    // console.log(parts);
    const userPhotoExt = parts1[parts1.length - 1]
    const postImgExt = parts2[parts2.length - 1]

    // console.log(ext);
    const newUserPhotoPath = path + '.' + userPhotoExt;
    const newPostImgPath = postImgPath + '.' + postImgExt;

    // console.log(newPath);
    fs.renameSync(path, newUserPhotoPath)
    fs.renameSync(postImgPath, newPostImgPath)

    // // console.log(originalname, path);
    // // console.log(postImgName, postImgPath);
    // console.log("datats", req.body);
    let { postId, title, content, userPhoto, userName, postImg } = req.body;
    // let { content } = req.body
    // let {  } = req.body
    // console.log(postId);

    // console.log(postId, title, userPhoto, userName, postImg, content);
    // if (title.length >= 1) {
    //     await postModel.findByIdAndUpdate(postId, { $set: { title } })
    // }
    // if (userPhoto) {
    //     await postModel.findByIdAndUpdate(postId, { $set: { userPhoto: newUserPhotoPath.slice(8) } })
    // }
    // if (userName.length >= 1) {
    //     await postModel.findByIdAndUpdate(postId, { $set: { userName } })
    // }
    // if (postImg) {
    //     await postModel.findByIdAndUpdate(postId, { $set: { postImg: newPostImgPath.slice(8) } })
    // }
    // if (PostContent.length >= 1) {
    //     await postModel.findByIdAndUpdate(postId, { $set: { PostContent: content } })
    // }
    let updatePostVals = await postModel.findByIdAndUpdate(postId, { $set: { title, userPhoto: newUserPhotoPath.slice(8), userName, postImg: newPostImgPath.slice(8), postContent: content } });
    // // , , e, postImg: newPostImgPath, PostContent:' 
    res.status(200).json(updatePostVals)
    // res.status(200).send("successss")
});

//fetch all comments
router.get("/viewcomments", async (req, res) => {
    let viewComments = await commentModel.find();
    res.status(200).json(viewComments)
})

//grap particular post using comment id
router.post("/grapPostUsingCommentId", async (req, res) => {
    console.log(req.body);
    console.log(req.body.comment_id);
    // let comment
    // let grapPosts = await postModel.find();
    // res.status(200).json(grapPosts)
})
module.exports = router;