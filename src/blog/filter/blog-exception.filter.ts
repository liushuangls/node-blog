import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { httpErrorLogger } from '../../common/logger/logger';

@Catch()
export class BlogExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    // 不计入日志的错误码
    const arr = [403, 404, 444, 400]

    if (arr.indexOf(exception.status) === -1) {
      httpErrorLogger(request, response, exception)
    }

    if (exception.status === 404) {
      response.render('404')
      // dto 验证错误
    } else if (exception.status === 444) {
      request.flash('error', exception.message.message)
      response.redirect('back')
    } else {
      let message = ''
      if (exception.message) {
        message = typeof exception.message === 'string'
          ? exception.message
          : exception.message.message
      } else {
        message = exception.ValidationError
      }
      request.flash('error', message)
      response.redirect('/posts')
    }

  }
}
