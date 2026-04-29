const Assignment = require('../models/Assignment');
const Article = require('../models/Article');
const Submission = require('../models/Submission');
const Activity = require('../models/Activity');

class AssignmentService {
  async getAllAssignmentsAdmin(userId, userRole) {
    const filter = {};
    if (userRole === 'author') {
      filter.createdBy = userId;
    }
    // Populate articleId to get the title
    const assignments = await Assignment.find(filter)
      .populate('articleId', 'title')
      .sort({ createdAt: -1 });
    return assignments;
  }

  async getAssignmentById(id) {
    const assignment = await Assignment.findById(id).populate('articleId', 'title');
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    return assignment;
  }

  async getAssignmentByArticle(articleId) {
    const assignment = await Assignment.findOne({ articleId, status: 'active' });
    return assignment;
  }

  async createAssignment(data, userId) {
    const article = await Article.findById(data.articleId);
    if (!article) {
      throw new Error('Article not found');
    }
    
    // Check if assignment already exists for this article
    const exists = await Assignment.findOne({ articleId: data.articleId });
    if (exists) {
      throw new Error('Assignment already exists for this article');
    }

    const assignment = await Assignment.create({ ...data, createdBy: userId });

    await Activity.create({
      userId,
      type: 'assignment_created',
      title: 'Created an Assignment',
      description: `You created a new assignment: ${assignment.title}.`,
      metadata: { assignmentId: assignment._id }
    });

    return assignment;
  }

  async updateAssignment(id, data, userId, userRole) {
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (userRole === 'author' && assignment.createdBy.toString() !== userId.toString()) {
      throw new Error('Not authorized to update this assignment');
    }

    assignment.set(data);
    await assignment.save();

    await Activity.create({
      userId,
      type: 'assignment_updated',
      title: 'Updated an Assignment',
      description: `You updated the assignment: ${assignment.title}.`,
      metadata: { assignmentId: assignment._id }
    });

    return assignment;
  }

  async deleteAssignment(id, userId, userRole) {
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (userRole === 'author' && assignment.createdBy.toString() !== userId.toString()) {
      throw new Error('Not authorized to delete this assignment');
    }

    // Check for existing submissions
    const submissionCount = await Submission.countDocuments({ assignmentId: id });
    
    if (submissionCount > 0) {
      // Soft delete / archive
      assignment.status = 'inactive';
      await assignment.save();
      return { message: 'Assignment archived because it has existing submissions', assignment };
    } else {
      // Hard delete
      await Assignment.findByIdAndDelete(id);
      return { message: 'Assignment deleted permanently' };
    }
  }
}

module.exports = new AssignmentService();
