import catchAsyncErrors from '../../middlewares/catch-async-errors.middleware';
import {
  issueCommentHandler,
  issuesHandler,
  pullRequestReviewHandler,
  pushHandler,
  registryPackageHandler,
} from '../../handlers';

class WebhookController {
  process = catchAsyncErrors(async (request, response) => {
    const deliveryUuid = request.header('X-GitHub-Delivery');
    const event = request.header('X-GitHub-Event');
    const hookId = request.header('X-GitHub-Hook-ID');
    const payload = request.body;

    const eventHandlers = {
      push: pushHandler,
      registry_package: registryPackageHandler,
      pull_request_review: pullRequestReviewHandler,
      issue_comment: issueCommentHandler,
      issues: issuesHandler,
    };

    if (Object.prototype.hasOwnProperty.call(eventHandlers, event)) {
      eventHandlers[event](deliveryUuid, hookId, payload);
    }

    response.status(202).json({
      success: true,
      message: 'Accepted. Webhook is being processed.',
      data: {
        deliveryUuid,
        event,
        hookId,
      },
    });
  });
}

export default WebhookController;
