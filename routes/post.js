const router =  require("express").Router();
const  Post =require("../models/Post");

//multer
const multer = require("multer");
const storage = multer.diskStorage({
    destination:function(req, file, callback){
        callback(null, "./upload/")
    },
    filename:function (req, file, callback){
        callback(null , new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
})
const fileFilter = (req, file, callback) => {
    if (file.mimeType === 'image/jpeg' || file.mimeType === 'image/png'){
        callback(null, true)
    }
    else {
        callback(null, false)
    }
}

const upload = multer({
    storage:storage,
    limits:{
        fileSize:1024*1024*5
    },

})

//create
router.post('/create', upload.single('postImg'),async (req,res)=>{

    try {
        const newPost = new Post({
            title:req.body.title,
            desc:req.body.desc,
            username:req.body.username,
            postImg:req.file.filename,
            designation:req.body.designation
        })
        const post = await newPost.save();
        res.status(200).json(post);
    }
    catch (err){
        res.status(500).json(err);
    }
})

//get
router.get('/',async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    const username = req.query.user;
    try {
        let post;
        if (username){
            post = await Post.find({username})
        }
        else {
            post = await Post.find();
        }
        res.status(200).json(post);
    }
    catch (err){
        res.status(500).json(err);
    }
})

router.get("/:id", async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post);
    }
    catch (err){
        res.status(500).json(err);
    }
})

module.exports = router;