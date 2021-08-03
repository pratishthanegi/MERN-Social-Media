const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");


//CREATE A POST
router.post("/", async (req,res) => {
    const newPost = new Post(req.body);
    try{
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    }
    catch(err){
        res.status(500).json(err);
    }
});

//UPDATE A POST
router.put("/:id", async (req,res) => {
    try{
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            await post.updateOne({$set:req.body});
            res.status(200).json("Post updated successfully");
        }
        else{
            res.status(403).json("You can update only your posts");
        }
    }
    catch(err){
        res.status(500).json(err);
    }
});

//DELETE A POST
router.delete("/:id", async (req,res) => {
    try{
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            await post.deleteOne({$set:req.body});
            res.status(200).json("Post deleted successfully");
        }
        else{
            res.status(403).json("You can delete only your posts");
        }
    }
    catch(err){
        res.status(500).json(err);
    }
});

//LIKE A POST
router.put("/:id/like", async (req,res) => {
    try{
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({$push:{likes:req.body.userId}});
            res.status(200).json("Liked the post");
        }
        else{
            await post.updateOne({$pull:{likes:req.body.userId}});
            res.status(200).json("Removed the like");
        }
    }
    catch(err){
        res.status(500).json(err);
    }
});

//COMMENT ON A POST
router.put("/:id/comment", async (req,res) => {
    try{
        const post = await Post.findById(req.params.id);
            await post.updateOne({$push:{comments:req.body}});
            res.status(200).json("Commented on the post");
    }
    catch(err){
        res.status(500).json(err);
    }
});

//GET A POST
router.get("/:id", async (req,res) => {
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    }
    catch(err){
        res.status(500).json(err);
    }
}); 

//GET ALL TIMELINE POSTS
router.get("/timeline/:userId", async (req,res) => {
    let postArray = [];
    try{
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({userId: currentUser._id});
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({userId: friendId});
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts))
    } 
    catch(err){
        res.status(500).json(err);
    }
});


module.exports = router;
