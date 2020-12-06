const { AuthenticationError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../utils/check-auth");

module.exports = {
  Query: {
    async getPosts() {
      console.log("getPosts");
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);

        if (post) {
          return post;
        } else {
          throw new Error("Post Not Found");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    // Create Post
    async createPost(_, { body }, context) {
      console.log("createPost");
      const user = checkAuth(context);

      if (body.trim() === "") {
        throw new Error("Post body must not be empty");
      }

      const newPost = new Post({
        body,
        username: user.username,
        user: user._id,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();

      // subscription
      context.pubsub.publish("NEW_POST", {
        newPost: post,
      });

      return post;
    },
    // Delete Post
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);

      try {
        const post = await Post.findById(postId);

        if (user.username === post.username) {
          await post.delete();
          return "Post Deleted";
        } else {
          throw new AuthenticationError("Action Not Allowed");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_POST"),
    },
  },
};
