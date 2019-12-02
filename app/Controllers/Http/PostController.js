'use strict';
const { get, first } = require('lodash');

const Category = use('App/Models/Category');
const Hashtag = use('App/Models/Hashtag');
const User = use('App/Models/User');
const Post = use('App/Models/Post');
const Media = use('App/Models/Media');
const { Timing, Storage } = use('App/Utils');
const { MEDIA_TYPE } = use('App/Constant/defaultValue');
const Database = use('Database');

const Helpers = use('Helpers');
const { validateAll } = use('Validator');

const snakeCaseKeys = require('snakecase-keys');

class PostController {
  async getCategories({ request, response }) {
    try {
      const categories = await Category.all();
      response.ok(categories.toJSON());
    } catch (error) {
      console.log('error', error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async savePost({ auth, request, response }) {
    try {
      const user = await auth.getUser();
      let data = request.only(['title', 'description', 'link', 'hashtags', 'categoryId']);

      data = snakeCaseKeys(data);

      data.hashtags = JSON.parse(get(data, 'hashtags'));

      const dataRules = {
        title: 'required|min:10|max:200',
        description: 'max:1000',
        link: 'required',
        hashtags: 'required|array',
        categoryId: 'required|number'
      };

      const validation = await validateAll(data, snakeCaseKeys(dataRules));

      const mediaValidationOptions = {
        types: ['image'],
        size: '3mb'
      };
      const media = request.file('media', mediaValidationOptions);
      await media.move(Helpers.tmpPath('uploads'), {
        name: `post-${user.id}-${new Date().getTime()}.${media.extname}`
      });

      const mediaPath = `${get(media, '_location')}/${get(media, 'fileName')}`;

      const mediaUrl = await Storage.addFile(mediaPath);

      if (validation.fails()) {
        console.log(validation.messages());
        return response.badRequest(validation.messages());
      }

      const category = await Category.findOrFail(data.category_id);

      const post = await user.posts().create({
        title: data.title,
        description: data.description,
        link: data.link
      });

      await category.posts().save(post);

      const hashtags = get(data, 'hashtags', []);
      const hashtagIds = await Promise.all(
        hashtags.map(async hashtag => {
          const hashtagRes = await Hashtag.findOrCreate({ name: hashtag }, { name: hashtag });
          return hashtagRes.id;
        })
      );

      await post.hashtags().attach(hashtagIds);

      const mediaRes = await post.media().create({
        source: mediaUrl,
        ext: media.extname,
        type: MEDIA_TYPE.image
      });

      response.ok({
        ...post.toJSON(),
        media: mediaRes.toJSON(),
        category: category.toJSON(),
        hashtags
      });
    } catch (error) {
      console.log('error', error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async getPostByUser({ request, response }) {
    try {
      let data = request.only(['userId', 'limit', 'page']);
      data = snakeCaseKeys(data);

      const { user_id, limit, page } = data;

      const posts = await Post.query()
        .with('user.profile')
        .with('category', builder => builder.select('id', 'name'))
        .with('hashtags', builder => builder.select('id', 'name as tag'))
        .with('media')
        .withCount('likeds as total_likeds')
        .where({ user_id })
        .where({ is_active: true })
        .orderBy('created_at', 'desc')
        .paginate(page, limit);

      response.ok(posts.toJSON());
    } catch (error) {
      console.log('error', error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async getLikedPostByUser({ request, response }) {
    try {
      let data = request.only(['userId', 'limit', 'page']);
      data = snakeCaseKeys(data);
      const { user_id, limit, page } = data;

      const posts = await Post.query()
        .with('user.profile')
        .with('category', builder => builder.select('id', 'name'))
        .with('hashtags', builder => builder.select('id', 'name as tag'))
        .with('likes', builder => builder.select('id', 'name as tag'))
        .with('media')
        .withCount('likeds as total_likeds')
        .where({ is_active: true })
        .whereIn(
          'id',
          Database.select('post_id')
            .from('likes')
            .where({ user_id })
            .orderBy('id', 'desc')
        )
        .paginate(page, limit);

      response.ok(posts.toJSON());
    } catch (error) {
      console.log('error', error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async getPosts({ auth, request, response }) {
    try {
      let data = request.only(['orderBy', 'q', 'limit', 'page']);
      data = snakeCaseKeys(data);
      const { q, limit, page } = data;

      const user = await auth.getUser();

      const postQuery = Post.query()
        .with('user.profile')
        .with('category', builder => builder.select('id', 'name'))
        .with('hashtags', builder => builder.select('id', 'name as tag'))
        .with('media')
        .withCount('likeds as total_likeds')
        .withCount('likeds as is_user_liked', builder => builder.where({ user_id: user.id }))
        .where({ is_active: true });

      const order = get(data, 'order_by');

      if (q) {
        postQuery.where('title', 'like', `%${q}%`);
      }

      switch (order) {
        case 'NEWEST':
          postQuery.orderBy('created_at', 'desc');
          break;

        case 'POPULAR':
          postQuery.orderBy('view', 'desc');
          break;

        default:
          break;
      }

      const posts = await postQuery.paginate(page, limit);

      response.ok(posts.toJSON());
    } catch (error) {
      console.log('error', error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async likePost({ auth, request, response }) {
    try {
      const data = request.only(['postId', 'hasLiked']);
      const { postId, hasLiked } = data;

      const user = await auth.getUser();

      if (hasLiked) {
        await user.likes().detach(postId);
      } else {
        await user.likes().attach(postId);
      }
      //  add fake delay
      await Timing.delay(1000);
      response.ok(postId);
    } catch (error) {
      console.log('error', error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async openPostLinking({ auth, request, response }) {
    try {
      const data = request.only(['postId']);

      const { postId } = data;

      await Database.table('posts')
        .where('id', postId)
        .increment('view', 1);

      response.ok(postId);
    } catch (error) {
      console.log('error', error);
      const { status } = error;
      response.status(status).send(error);
    }
  }

  async deletePost({ auth, request, response }) {
    try {
      const data = request.only(['postId']);

      const { postId } = data;
      const user = await auth.getUser();

      const posts = await Post.query()
        .where({ user_id: user.id })
        .where({ id: postId })
        .fetch();

      const post = first(posts.rows);

      if (!post) {
        return response.forbidden({ forbidden: 'permission denied!' });
      }

      post.merge({ is_active: false });
      await post.save();

      response.ok(postId);
    } catch (error) {
      console.log('error', error);
      const { status } = error;
      response.status(status).send(error);
    }
  }
}

module.exports = PostController;
