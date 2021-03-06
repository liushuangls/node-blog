import { Injectable } from '@nestjs/common';
import { UserInterface } from '../../model/User';
import { format } from '../../common/utils';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentInterface } from '../../model/Comment';

@Injectable()
export class UserService {
  public readonly pageSize = 12

  constructor(
    @InjectModel('user') private readonly userModel: Model<UserInterface>,
    @InjectModel('comment') private readonly commentModel: Model<CommentInterface>
  ) { }

  async getAllUsers(page = 1) {
    let users = await this.userModel
      .find().skip((page - 1) * this.pageSize).limit(this.pageSize)

    let promiseUsers = users.map(async user => {
      user = user.toObject()
      user.ct = format(user.ct)
      user['commentsCount'] = await this.commentModel.countDocuments({ author: user._id })
      return user
    })
    return Promise.all(promiseUsers)
  }

  // 根据id删除user
  async delUserById(id: any) {
    try {
      await this.userModel.deleteOne({ _id: id })
      // 删除该用户的评论
      await this.commentModel.deleteMany({ author: id })
      return true
    } catch (e) {
      throw new Error('用户不存在')
    }
  }

  // 新建用户
  async addUser(user) {
    return await new this.userModel(user).save()
  }

  // 根据id查询用户
  async getUserById(id) {
    return await this.userModel.findById(id)
  }

  // 查找用户
  async getUser(query) {
    return await this.userModel.findOne(query)
  }

  // 获取用户数
  async getUsersCount() {
    return await this.userModel.countDocuments()
  }
}
