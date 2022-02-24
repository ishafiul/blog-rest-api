const router =  require("express").Router();
const  Post =require("../models/Post");


//create
router.post('/create',async (req,res)=>{
    try {
        const newPost = new Post({
            title:req.body.title,
            desc:req.body.desc,
            username:req.body.username,
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

module.exports = router;